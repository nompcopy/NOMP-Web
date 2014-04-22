// ticketDisplayer
var utils = require('../../lib/utils');
var ticketUtils = require('./ticketUtils');
var async = require('async');

var mongoose = require('mongoose');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');

/*
 * Logic: the index ticket page is empty concerning mongoose
 * We may use REST conception to get the list of tickets
 */
exports.index = function(req, res) {
    var ticket_type = req.params.type;
    if (typeof(ticket_type) === undefined) {
        var title = 'HomePage';
    }
    else {
        var title = 'List of ' + ticket_type;
    }
    res.render('tickets/index', {
        title: '',
        ticket_type: ticket_type,
        req: req
    });
};


exports.show = function(req, res) {
    var ticket = req.ticket;
    var render_data = {
        ticket: ticket,
        title: ticket.name,
        ticket_type: req.params.type,
        req: req
    };
    // Use ajax to get the content of source ticket
    if (typeof(req.query.source_id) !== 'undefined') {
        render_data.source_id = req.query.source_id,
        render_data.source_type = req.query.source_type
    }
    return res.render('tickets/show', render_data);
};


exports.list = function(req, res) {
    // TODO: pagination or limit of data size
    var options = {
        criteria: {
            is_active: 1,
    }};
    // TODO and ATTENTION: add 'public' target_actor_type._id, now I just use this
    // Attention: This is a mongoDB query, not Mongoose
    if (req.isAuthenticated() && req.session.admin) {
        options.criteria.is_active = {$in: [0, 1]};
    }
    else if (req.isAuthenticated()) {
        options.criteria.target_actor_type = {$in: ['5336b94ac1bde7b41d90377a', req.user.actor_type]};
    }
    else {
        options.criteria.target_actor_type = {$in: ['5336b94ac1bde7b41d90377a']};
    }

    // Prepare query params
    if (req.query.limit) {
        options.limit = req.query.limit;
    }
    if (req.query.offset) {
        options.offset = req.query.offset;
    }
    if (req.query.classification) {
        options.criteria.classification = req.query.classification;
    }

    var render_items = [];
    // Use async fonction to manage the general feed and user owner list feed
    async.waterfall([
        function(callback) {
            ticketUtils.feedTicketJsonList(req, options, function(err, items) {
                callback(null, render_items.concat(items));
            });
        },
        function(render_items, callback) {
            if (req.isAuthenticated()) {
                ticketUtils.feedOwnerJsonList(req, function(err, items) {
                    callback(null, render_items.concat(items));
                });
            }
            else {
                callback(null, render_items);
            }
        }
    ], function(err, render_items) {
        render_items = utils.sortArrayObjectByProperty('update_date', render_items);
        return res.json(render_items);
    });
}


exports.showJson = function(req, res) {
    if (req.params.type == 'need') {
        NeedModel.loadJson(req.params.ticketId, function(err, item) {
            res.json(item);
        });
    }
    else if (req.params.type == 'offer') {
        OfferModel.loadJson(req.params.ticketId, function(err, item) {
            res.json(item);
        });
    }
}


exports.ownerJsonList = function(req, res) {
    return ticketUtils.feedOwnerJsonList(req, function(err, items) {
        res.json(items);
    });
}
