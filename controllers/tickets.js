// tickets.js
/*
 * GET ticket home page.
 */
var async = require('async');

var mongoose = require('mongoose');
var utils = require('../lib/utils');
var TicketModel = mongoose.model('TicketModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');
var MatchingModel = mongoose.model('MatchingModel');

/*
 * Logic: the index ticket page is empty concerning mongoose
 * We may use REST conception to get the list of tickets
 */
exports.index = function(req, res) {
    // load test need ticket
    res.render('tickets/index', { title: 'Tickets Index' });
};


exports.list = function(req, res) {
    // TODO: pagination or limit of data size
    // This is a REST conception
    var options = {};
    var dataToDisplay = {};
    if (req.params.type == 'need') {
        NeedModel.listToJson(options, function(err, items) {
            res.json(items);
        });
    }
    else if (req.params.type == 'offer') {
        OfferModel.listToJson(options, function(err, items) {
            res.json(items);
        });
    }
    else {
        //TODO, 404 or redirection
    }
}


exports.new = function(req, res) {
    if (req.params.type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.params.type === 'offer') {
        var ticket = new OfferModel(req.body);
    }
    res.render('tickets/form', {
        title: 'Create a new ' + req.params.type,
        ticket: ticket,
        ticket_type: req.params.type,
        post_action: (req.params.type + '/create').toString()
    });
};

exports.create = function(req, res) {
    if (req.body.ticket_type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.body.ticket_type === 'offer') {
        var ticket = new OfferModel(req.body);
    }
    ticket.save(function(err) {
        if (err) {
            return res.render('tickets/form', {
                error: utils.errors(err.errors),
                ticket: ticket,
                title: 'Create a new ' + req.body.ticket_type,
                ticket_type: req.body.ticket_type,
                post_action: (req.body.ticket_type + '/create').toString()
            });
        } else {
            // load ticket view once created
            return res.redirect(req.body.ticket_type + '/' + ticket._id);
        }

    });
}

exports.show = function(req, res) {
    if (req.params.type === 'need') {
        NeedModel.load(req.params.id, function(err, ticket) {
            if (err) {
                //TODO
            } else {
                return res.render('tickets/show', {
                    ticket: ticket,
                    title: ticket.name,
                    ticket_type: req.params.type
                });
            }
        });
    }
    else if (req.params.type === 'offer') {
        OfferModel.load(req.params.id, function(err, ticket) {
            if (err) {
                //TODO
            } else {
                return res.render('tickets/show', {
                    ticket: ticket,
                    title: ticket.name,
                    ticket_type: req.params.type
                });
            }
        });
    }
};

exports.edit = function(req, res) {
    async.waterfall([
        function(callback) {
            if(req.params.type === 'need') {
                NeedModel.load(req.params.id, function(err, ticket) {
                    callback(null, ticket);
                });
            }
            else if(req.params.type === 'offer') {
                OfferModel.load(req.params.id, function(err, ticket) {
                    callback(null, ticket);
                });
            }
        },
    ], function(err, ticket) {
        return res.render('tickets/form', {
            ticket: ticket,
            ticket_type: req.params.type,
            title: ticket.name,
            post_action: (req.params.type + '/' + ticket._id).toString()
        });
    });
};

exports.update = function(req, res) {
    var ticket_type = req.params.type;
    // Load
    async.waterfall([
        function(callback) {
            if (ticket_type === 'need') {
                NeedModel.load(req.params.id, function(err, ticket) {
                    callback(null, ticket);
                });
            }
            else if (ticket_type === 'offer') {
                OfferModel.load(req.params.id, function(err, ticket) {
                    callback(null, ticket);
                });
            }
        },
    ], function(err, ticket) {
        ticket.update(req.body, function(err) {
            if (!err) {
                return res.redirect('/' + ticket_type + '/' + ticket._id);
            }
            return res.render('tickets/form', {
                error: utils.errors(err.errors),
                ticket: ticket,
                title: ticket.name,
                ticket_type: ticket_type,
                post_action: (ticket_type + '/' + ticket._id).toString()
            });
        });
    });
}

exports.matching = function(req, res) {
    var ticket_type = req.params.type;
    var m = new MatchingModel({
        source_id: req.params.id,
        source_type: ticket_type,
    });
    m.matchEngine(function(err, results) {
        console.log(results);
    });

}
exports.class_list = function(req, res) {
    ClassificationModel.listToJson(function(err, items) {
        res.json(items);
    });
}

exports.actor_type_list = function(req, res) {
    ActorTypeModel.listToJson(function(err, items) {
        res.json(items);
    });
}
