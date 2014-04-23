// ticketDisplayer
var utils = require('../../lib/utils');
var ticketUtils = require('./ticketUtils');
var async = require('async');

var mongoose = require('mongoose');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');
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

    var render_items = [];
    // Use async fonction to manage the general feed and user owner list feed
    async.waterfall([
        // actor type and classification
        function(callback) {
            if (req.query.filters) {
                var fieldOptions = {};
                // Try to uniform the filters
                async.waterfall([
                    // Manage classifications
                    function(class_callback) {
                        if (typeof(req.query.filters.classification) !== 'undefined') {
                            // exist of parent class
                            if (typeof(req.query.filters.is_parent) !== 'undefined'
                                && req.query.filters.is_parent.indexOf('classification') > -1) {
                                fieldOptions.select = '_id';
                                fieldOptions.criteria = {
                                    parent: req.query.filters.classification
                                };
                                ClassificationModel.listToJson(fieldOptions, function(err, items) {
                                    // Make arr of ids classification
                                    options.criteria.classification = {$in: utils.getIdsArray(items)};
                                    class_callback(null, options);
                                });
                            }
                            // Child class
                            else {
                                options.criteria.classification = req.query.filters.classification;
                                class_callback(null, options);
                            }
                        }
                        else {
                            class_callback(null, options);
                        }
                    },
                    // Manage actor type
                    function(options, actor_callback) {
                        if (typeof(req.query.filters.source_actor_type) !== 'undefined') {
                            // exist of parent actor type
                            if (typeof(req.query.filters.is_parent) !== 'undefined'
                                && req.query.filters.is_parent.indexOf('actortype') > -1) {
                                fieldOptions.select = '_id';
                                fieldOptions.criteria = {
                                    parent: req.query.filters.source_actor_type
                                };
                                ActorTypeModel.listToJson(fieldOptions, function(err, items) {
                                    // Make arr of ids actor types
                                    options.criteria.source_actor_type = {$in: utils.getIdsArray(items)};
                                    actor_callback(null, options);
                                });
                            }
                            // Child actor type
                            else {
                                options.criteria.source_actor_type = req.query.filters.source_actor_type;
                                actor_callback(null, options);
                            }
                        }
                        else {
                            actor_callback(null, options);
                        }
                    }
                ], function(err, options) {
                    callback(null, options);
                });
            }
            else {
                callback(null, options);
            }
        },
        function(options, callback) {
            ticketUtils.feedTicketJsonList(req, options, function(err, items) {
                callback(null, render_items.concat(items));
            });
        },
        function(render_items, callback) {
            if (req.isAuthenticated()) {
                ticketUtils.feedOwnerJsonList(req, options, function(err, items) {
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
