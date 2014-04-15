// MatchingModel.js
var gm = require('googlemaps');
var distance = require('google-distance');

var utils = require('../lib/utils');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TicketModel = mongoose.model('TicketModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');


var MatchingModelSchema = new Schema({
    source_id: {type: Schema.ObjectId},
    source_type: {type: String},
    is_match: {type: Boolean, default: true},
    results: [{}]
});


/*
 * prepare query data if use search
 *
 */
MatchingModelSchema.methods = {
    // Basic methods
    update: function(data, cb) {
        for (property in data) {
            this[property] = data[property];
        }
        this.save(cb);
    },
    searchEngine: function(data, cb) {
        match(data, cb);
    },
    // TODO: I know those if statements are shit
    matchEngine: function(cb) {
        var source_id = this.source_id;
        var source_type = this.source_type;
        async.waterfall([
            function(callback) {
                if (source_type == 'need') {
                    NeedModel.load(source_id, function(err, ticket) {
                        // Prepare data
                        var data = {
                            keywords: ticket.keywords,
                            classification: [ticket.classification],
                            target_actor_type: [ticket.target_actor_type],
                            source_type: source_type,
                            // TODO, may use google location or latitude longitude data
                            location: ticket.address,
                            is_match: true,
                            start_date: ticket.start_date,
                            end_date: ticket.end_date,
                            quantity: ticket.quantity
                            // TODO, cost
                        };
                        callback(null, data);
                    });
                }
                else if (source_type == 'offer') {
                    OfferModel.load(source_id, function(err, ticket) {
                        // Prepare data
                        var data = {
                            keywords: ticket.keywords,
                            classification: [ticket.classification],
                            target_actor_type: [ticket.target_actor_type],
                            source_type: source_type,
                            location: ticket.address,
                            is_match: true,
                            start_date: ticket.start_date,
                            end_date: ticket.end_date
                        }
                        callback(null, data);
                    });
                }
            },
            function(data, callback) {
                match(data, callback);
            }
        ], cb);
    }
};

MatchingModelSchema.statics = {
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },
    retrieveByTicket: function(ticket_id, ticket_type, cb) {
        this.findOne({
            source_id: ticket_id,
            source_type: ticket_type
        }).exec(cb);
    }
};

function match(data, cb) {
    async.waterfall([
        // Matcher a list of tickets with same classification and target actor type
        function(callback) {
            if (data.is_match) {
                if (data.source_type == 'offer') {
                    NeedModel.findByActorTypeAndClassification(
                        data.target_actor_type,
                        data.classification, function(err, list) {
                            callback(null, data, list);
                        });
                }
                else if (data.source_type == 'need') {
                    OfferModel.findByActorTypeAndClassification(
                        data.target_actor_type,
                        data.classification, function(err, list) {
                            callback(null, data, list);
                        });
                }
            }
            else {
                async.waterfall([
                    function(list_callback) {
                        NeedModel.findByTargetActorType(
                            data.target_actor_type, function(err, need_list) {
                            if (need_list) {
                                list_callback(null, data, need_list);
                            }
                            else {
                                list_callback(null, data, []);
                            }
                        });
                    },
                    function(data, need_list, list_callback) {
                        OfferModel.findByTargetActorType(
                            data.target_actor_type, function(err, offer_list) {
                                if (offer_list) {
                                    list_callback(null, data, need_list.concat(offer_list));
                                } else {
                                    list_callback(null, data, need_list);
                                }
                            });
                    }
                ], function(err, data, list) {
                    callback(null, data, list);
                });
            }
        },
        // Find keywords in the list
        function(data, list, callback) {
            searchKeyWords(data, list, function(err, search_score_results) {
                callback(null, data, search_score_results);
            });
        },
        // Compute Distance score
        // We can put it before the search, with elimination of K value
        // This one may be more efficient
        function(data, search_score_results, callback) {
            // if search, we do nothing here
            if (data.is_match === false) {
                callback(null, data, search_score_results);
            }
            else {
                computeDistance(data, search_score_results, function(err, distance_score_results) {
                    callback(null, data, distance_score_results)
                });
            }
        },
        // Compute the dates
        function(data, distance_score_results, callback) {
            if (data.is_match === false) {
                callback(null, data, distance_score_results);
            }
            else {
                date_score_results = computeDates(data, distance_score_results);
                callback(null, data, date_score_results);
            }
        },
        // Compute quantity
        function(data, date_score_results, callback) {
            if (data.is_match == false) {
                callback(null, date_score_results);
            }
            else {
                quantity_score_results = computeQuantity(data, date_score_results);
                callback(null, quantity_score_results);
            }
        },
        // Order the results
        function(quantity_score_results, callback) {
            callback(null, utils.sortMatchingResults(quantity_score_results));
        }
    ], cb);
}


function computeQuantity(data, target_list) {
    for (var index=0; index<target_list.length; index++) {
        if (data.quantity <= target_list[index].ticket.quantity) {
            target_list[index].score += 0.3;
        }
    }
    return target_list;
}


function computeDates(data, target_list) {
    for (var index=0; index<target_list.length; index++) {
        if (utils.betweenDates(data.start_date, data.end_date, target_list[index].ticket.start_date)) {
            target_list[index].score += 0.3;
        }
        if (utils.betweenDates(data.start_date, data.end_date, target_list[index].ticket.end_date)) {
            target_list[index].score += 0.3;
        }
    }
    return target_list;
}


function computeDistance(data, target_list, cb) {
    var distance_score_results = [];
    async.waterfall([
        function(callback) {
            if (target_list.length === 0) {
                callback(null, []);
            }
            var index = 0;
            async.each(target_list, function(target_ticket, iterator_callback) {
                index++;
                distance.get({
                    origin: data.location,
                    destination: target_ticket.ticket.address,
                    units: 'metric'
                }, function(err, distance_result) {
                    if (typeof(distance_result) === 'undefined') {
                        console.log('Address not found');
                        distance_score_results.push(target_ticket);
                    }
                    else {
                        // TODO, an evaluation algo
                        if (distance_result.distance <'700 km') {
                            target_ticket.score += 1;
                        }
                        distance_score_results.push(target_ticket);
                    }
                    // callback to higher level if complete
                    if (distance_score_results.length === index) {
                        callback(null, distance_score_results);
                    }
                });
                iterator_callback();
            });
        },
        function(distance_score_results, callback) {
            callback(null, distance_score_results);
        }
    ], cb);

}

function searchKeyWords(data, list, cb) {
    var target_list = list || null;
    var results = [];
    async.waterfall([
        // Iterator keys
        function(callback) {
            console.log('Start iteration keys words search');
            var index = 0;
            async.eachSeries(data.keywords, function(keyword, iterator_key_callback) {
                searchKeyWord(keyword, target_list, data.source_type, function(err, one_key_results) {
                    index++;
                    // We only care the final result to call back
                    results.push(one_key_results);
                    if (data.keywords.length == index) {
                        callback(null, results);
                    }
                    
                });
                iterator_key_callback();
            });
        },
        // Add up the scores from results
        function(results, callback) {
            callback(null, mergeResults(results));
        }
    ], cb);
}


// Search the tickets by one key word from name and description
function searchKeyWord(keyword, list, source_type, cb) {
    var target_list = list || [];

    async.waterfall([
        // Search name field by keys
        function(callback) {
            console.log('Start One Key Word Search');
            if (source_type == 'offer') {
                NeedModel.findObjectByKeyword('name', keyword, target_list, function(err, name_results) {
                    callback(null, name_results);
                });
            }
            else if (source_type == 'need') {
                OfferModel.findObjectByKeyword('name', keyword, target_list, function(err, name_results) {
                    callback(null, name_results);
                });
            } else {
                var name_results = [];
                OfferModel.findObjectByKeyword('name', keyword, target_list, function(err, offer_name_results) {
                    NeedModel.findObjectByKeyword('name', keyword, target_list, function(err, need_name_results) {
                        callback(null, need_name_results.concat(offer_name_results));
                    });
                });
            }
        },
        // Search description field by key
        function(name_results, callback) {
            if (source_type == 'offer') {
                NeedModel.findObjectByKeyword('description', keyword, target_list, function(err, description_results) {
                    var search_results = utils.union_arrays(name_results, description_results);
                    callback(null, search_results);
                });
            }
            else if (source_type == 'need') {
                OfferModel.findObjectByKeyword('description', keyword, target_list, function(err, description_results) {
                    var search_results = utils.union_arrays(name_results, description_results);
                    callback(null, search_results);
                });
            } else {
                var search_results = [];
                var description_results;
                OfferModel.findObjectByKeyword('description', keyword, target_list, function(err, offer_description_results) {
                    NeedModel.findObjectByKeyword('description', keyword, target_list, function(err, need_description_results) {
                        description_results = offer_description_results.concat(need_description_results);
                        search_results = utils.union_arrays(name_results, description_results);
                        callback(null, search_results);
                    });
                });
            }
        },
        // Load tickets and matching the result
        function(search_results, callback) {
            // If no results, callback []
            if (search_results.length == 0) {
                callback(null, search_results);
            }
            // Tickets container
            var tickets = [];
            async.each(search_results, function(ticket, callback1) {
                // Load ticket into search_result
                async.waterfall([
                    function(push_to_array) {
                        // TODO: need optimize, use another async.each to calculate scores and push back
                        tickets.push(calculateScore(ticket, keyword));
                        // We only callback the final result of array push
                        if (tickets.length == search_results.length) {
                            push_to_array(null, tickets);
                        }
                    }
                ], function(err, results) {
                    // Now we have the final load, callback to higher lever of async
                    callback (null, results);
                });
            });
        }
        // handy point to define the final cb function
        // cb = function(err, results) { do the process here};
    ], cb);
}


// uills functions
function calculateScore(ticket, key) {
    var matching_result = {};
    // We may use a iterator here but is annoying
    // name parse
    var term = ticket.name.match(new RegExp(key, 'ig'));
    var name_frequency = term ? term.length : 0;
    // description parse
    term = ticket.description.match(new RegExp(key, 'ig'));
    var description_frequency = term? term.length : 0;
    matching_result= {
        ticket: ticket,
        score: name_frequency * 1 + description_frequency * 0.2
    };

    return matching_result;
}


// Merge results double array into one array and add up the scores
function mergeResults(results) {
    // I tried to do this recursively but I'm stupid
    var arr = [];
    // Merge arrays
    for (var global_index=0; global_index<results.length; global_index++) {
        for (var index=0; index<results[global_index].length; index++) {
            var result = results[global_index][index];
            arr.push(result);
        }
    }
    var ids = [];

    // get list of ids
    for (var index=0; index<arr.length; index++) {
        if (!ids.contains(arr[index].ticket._id)) {
            ids.push(arr[index].ticket);
        }
    }

    // initial new result array by list of ids
    var new_result = [];
    for (var index=0; index<ids.length; index++) {
        new_result.push({
            ticket: ids[index],
            score: 0
        });
    }

    // Add up the score from old results, unique the array
    for (var ticket_index=0; ticket_index<new_result.length; ticket_index++) {
        for (var index=0; index<arr.length; index++) {
            if (new_result[ticket_index].ticket._id.toString() === arr[index].ticket._id.toString()) {
                new_result[ticket_index].score += arr[index].score;
            }
        }
    }

    return new_result;
}


// Built and exports Model from Schema
mongoose.model('MatchingModel', MatchingModelSchema);
exports.MatchingModel = mongoose.model('MatchingModel');

// var need_id = '53382a97bf1f99c83ea9523e';
// var m = new this.MatchingModel({
    // source_id: need_id,
    // source_type: 'need',
// });
// m.matchEngine(function(err, results) {
    // console.log(results);
// });