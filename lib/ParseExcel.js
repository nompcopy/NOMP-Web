// ParseExcel
var fs = require('fs');
var utils = require('./utils');
var xlsx = require('node-xlsx');

var async = require('async');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');

var TicketModelSchema = require('../models/TicketModel');


var ParseExcelSchema = new Schema({
    file: {type: String},
    ticket_type: {type: String, default: 'all'}, // need, offer, all
    user: {type: ObjectId}
});


var export_order = [
    'name',
    'classification',
    'source_actor_type',
    'target_actor_type',
    'contact_phone',
    'contact_mobile',
    'contact_email',
    'quantity',
    'description',
    'creation_date',
    'end_date',
    'start_date',
    'expiration_date',
    'adresse',
    'budget',
    'cost'
];
var date_properties = [
    'creation_date',
    'end_date',
    'start_date',
    'expiration_date'
];


ParseExcelSchema.methods = {
    import: function() {
        var datas = readFile(this.file);
        importTickets(this.user, datas);
    },
    // TODO: Should be an option here,
    // export by class, actor, type etc...
    export: function(options) {
        var options = options || {}
        var ticket_type = this.ticket_type;
        var filename = this.file;
        exportTickets(options, ticket_type, filename);
    }
}


/*
 * Export tickets
 */
// TODO: export all
function exportTickets(options, ticket_type, filename) {
    if (ticket_type == 'need') {
        NeedModel.listToJson(options, function(err, needs) {
            var content = buildHeader(ticket_type);
            buildContent(content, needs, function(err, result) {
                result = buildEnder(result);
                var file = xlsx.build(result);
                fs.writeFileSync(filename, file);
            });
        });
    }
    else if (ticket_type == 'offer') {
        OfferModel.listToJson(options, function(err, offers) {
            var content = buildHeader(ticket_type);
            buildContent(content, offers, function(err, result) {
                result = buildEnder(result);
                var file = xlsx.build(result);
                fs.writeFileSync(filename, file);
            });
        });
    }
}


function buildEnder(content) {
    content.creator =  'nomp';
    content.lastModifiedBy = 'nomp';
    content.activeWorksheet = 1;
    return content;
}


function buildContent(content, tickets, cb) {
    async.waterfall([
        // load class list
        function(callback) {
            ClassificationModel.list(function(err, class_list) {
                callback(null, class_list, content, tickets);
            });
        },
        // load actor list
        function(class_list, content, tickets, callback) {
            ActorTypeModel.list(function(err, actor_list) {
                callback(null, class_list, actor_list, content, tickets);
            });
        },
        // prepare the content of data need
        function(class_list, actor_list, content, tickets, callback) {
            for (var index_ticket=0; index_ticket<tickets.length; index_ticket++) {
                var ticket = tickets[index_ticket];
                var row = [];
                for (var index_order=0; index_order<export_order.length; index_order++) {
                    var field = export_order[index_order];
                    if (ticket.hasOwnProperty(field)) {
                        if (date_properties.indexOf(field) > -1) {
                            row.push({ value: ticket[field], formatCode: 'mm/dd/yy' });
                        }
                        else if (field == 'classification') {
                            var classification = utils.findObjectById(ticket[field], class_list);
                            row.push({ value: classification.name, formatCode: 'General' });
                        }
                        else if (field == 'source_actor_type' || field == 'target_actor_type') {
                            var actor_type = utils.findObjectById(ticket[field], actor_list);
                            row.push({ value: actor_type.name, formatCode: 'General' });
                        }
                        else {
                            row.push({ value: ticket[field], formatCode: 'General' });
                        }
                    }
                    else {
                        row.push({ value: null, formatCode: 'General' });
                    }
                }
                content.worksheets[0].data.push(row);
            }
            // Build worksheet ender
            content.worksheets[0].table = false;
            content.worksheets[0].maxCol = export_order.length;
            content.worksheets[0].maxRow = tickets.length;
            callback(null, content)
        }
    ], cb);
}


function buildHeader(ticket_type) {
    var content = { worksheets: [{ name: ticket_type, data: [] }]};
    var header = [];
    for (var index=0; index<export_order.length; index++) {
        header.push( {value: export_order[index], formatCode: 'General'} );
    }
    content.worksheets[0].data.push(header);
    return content;
}


/*
 * Only read the first worksheet
 * and parse begins with the second line
 */
function readFile(file) {
    var obj = xlsx.parse(file);
    return obj.worksheets[0].data;
}


/*
 * respect the index of files
 */
function importTickets(user_id, datas) {
    var user_id = user_id;
    var index = 0;
    async.eachSeries(datas, function(data, row_callback) {
        if (index == 0) {
            index++;
            row_callback();
        } else {
            parse_ticket(data, function(err, ticket) {
                var ticket_type = data[0].value;
                if (ticket_type == 'need') {
                    var need = new NeedModel(ticket);
                    need.user = user_id;
                    need.creatAndSave(function(err) {
                        console.log('saved');
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                else if (ticket_type == 'offer') {
                    var offer = new OfferModel(ticket);
                    offer.user = user_id;
                    offer.creatAndSave(function(err) {
                        console.log('saved');
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
            index++;
            row_callback();
        }
    });
}


/*
 * Parse ticket from excel row
 * Since there is no order for properties of an object
 * We don't use iteration function to parse the result
 */
// TODO, validations
function parse_ticket(data, cb) {
    var ticket = {};
    try {
        // index 0, type of ticket
        var ticket_type = data[0].value;
        // index 1, name of ticket
        ticket.name = data[1].value;
        // index 2-3, classification
        var parent_classification = data[2].value;
        var classification = data[3].value;
        // index 4-5, actor source
        var parent_source_actor_type = data[4].value;
        var source_actor_type = data[5].value;
        // index 6-7, actor target
        var parent_target_actor_type = data[6].value;
        var target_actor_type = data[7].value;
        // index 8, contact_phone
        ticket.contact_phone = data[8] === undefined ? '' : data[8].value;
        // index 6, mobile
        ticket.contact_mobile = data[9] === undefined ? '' :  data[9].value;
        // index 7, email
        ticket.contact_email = data[10] === undefined ? '' :  data[10].value;
        // index 8, quantity
        ticket.quantity = data[11].value;
        // index 9, description
        ticket.description = data[12].value;
        // index 10, creation_date
        ticket.creation_date = data[13].value;
        // index 11, end_date
        ticket.end_date = data[14].value;
        // index 12, start date
        ticket.start_date = data[15].value;
        // index 13, expiration date
        ticket.expiration_date = data[16].value;
        // index 14, address
        ticket.address = data[17].value;
        // index 16, latitude
        // index 17, longitude
        ticket.geometry = {
            lat: data[18].value,
            lng: data[19].value
        };
        // index 18, budget or cost
        if (ticket_type == 'need') {
            ticket.budget = data[20].value;
        }
        else if (ticket_type == 'offer') {
            ticket.cost = data[21].value;
        }
        // manage the search of class and actor type
        // Logic: find parent -> fetch child
        async.waterfall([
            // find class
            function(callback) {
                ClassificationModel.retrieveParentListByValue(parent_classification.trim(), function(err, parent_classificationList) {
                    if (parent_classificationList === null) {
                        throw 'Classification: ' + parent_classification + ' not found for ticket name ' + ticket.name;
                    }
                    else {
                        ticket = utils.smartFetchFields(ticket, classification, parent_classificationList, 'classification', 'classification_name');
                        callback(null, ticket);
                    }
                });
            },
            // find source_actor_type
            function(ticket, callback) {
                ActorTypeModel.retrieveParentListByValue(parent_source_actor_type.trim(), function(err, parent_actor_typeList) {
                    if (parent_actor_typeList === null) {
                        throw 'Source Actor Type not found for ticket name ' + ticket.name;
                    }
                    else {
                        ticket = utils.smartFetchFields(ticket, source_actor_type, parent_actor_typeList, 'source_actor_type', 'source_actor_type_name');
                        callback(null, ticket);
                    }
                });
            },
            // find target_actor_type
            function(ticket, callback) {
                ActorTypeModel.retrieveParentListByValue(parent_target_actor_type.trim(), function(err, parent_actor_typeList) {
                    if (parent_actor_typeList === null) {
                        throw 'Target Actor Type not found for ticket name ' + ticket.name + ' with actor name ' + target_actor_type;
                    }
                    else {
                        ticket = utils.smartFetchFields(ticket, target_actor_type, parent_actor_typeList, 'target_actor_type', 'target_actor_type_name');
                        callback(null, ticket);
                    }
                });
            }
        ], cb);
    } catch(msg) {
        console.log(msg);
        return null;
    }

}


// Built and exports Model from Schema
mongoose.model('ParseExcel', ParseExcelSchema);
exports.ParseExcel = mongoose.model('ParseExcel');

// var parse = new this.ParseExcel({file: './lib/Import_file.xlsx'});
// parse.import();
// var exportation = new this.ParseExcel({
    // file: './lib/test.xlsx',
    // ticket_type: 'offer' 
// });
// exportation.export(null);
