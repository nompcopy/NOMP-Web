// tickets.js
/*
 * GET ticket home page.
 */
var path = require('path');
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
 * Load
 */
exports.load = function(req, res, next, id) {
    async.waterfall([
        function(callback) {
            if(req.params.type === 'need') {
                NeedModel.load(req.params.ticketId, function(err, ticket) {
                    callback(null, ticket);
                });
            }
            else if(req.params.type === 'offer') {
                OfferModel.load(req.params.ticketId, function(err, ticket) {
                    callback(null, ticket);
                });
            }
        }
    ], function(err, ticket) {
        if (err) {
            return next(err);
        }
        if (!ticket) {
            return next(new Error('not found'));
        }
        req.ticket = ticket;
        next();
    });
};
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
    // var options = {};
    // NeedModel.list(options, function(err, list) {
        // if (err) {
            // res.render('tickets/index', { title: 'error' });
        // }
        // else {
            // res.render('tickets/index', {
                // title: 'Tickets',
                // tickets: list,
                // req: req
            // });
        // }
    // });
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
        post_action: (req.params.type + '/create').toString(),
        req: req
    });
};

exports.create = function(req, res) {
    if (req.body.ticket_type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.body.ticket_type === 'offer') {
        var ticket = new OfferModel(req.body);
    }

    // fetch class, actorType names
    async.waterfall([
        function(callback) {
            ClassificationModel.load(ticket.classification, function(err, classification) {
                ticket.classification_name = classification.name;
                callback(null, ticket);
            });
        },
        function(ticket, callback) {
            ActorTypeModel.load(ticket.source_actor_type, function(err, source_actor_type) {
                ticket.source_actor_type_name = source_actor_type.name;
                callback(null, ticket);
            });
        },
        function(ticket, callback) {
            ActorTypeModel.load(ticket.target_actor_type, function(err, target_actor_type) {
                ticket.target_actor_type_name = target_actor_type.name;
                callback(null, ticket);
            });
        },
        // associate image temp path
        function(ticket, callback) {
            for (var index=0; index<req.files.image.length; index++) {
                ticket.media.image.push(req.files.image[index].path)
            }
            callback(null, ticket);
        },
        // associate user if req is authenticated
        function(ticket, callback) {
            if (req.isAuthenticated()) {
                ticket.user = req.user._id;
                callback(null, ticket);
            }
            else {
                callback(null, ticket);
            }
        }
    ], function(err, ticket) {
        ticket.creatAndSave(function(err) {
            if (err) {
                return res.render('tickets/form', {
                    error: utils.errors(err.errors),
                    ticket: ticket,
                    title: 'Create a new ' + req.body.ticket_type,
                    ticket_type: req.body.ticket_type,
                    post_action: (req.body.ticket_type + '/create').toString(),
                    req: req
                });
            } else {
                req.flash('info', 'Please remember this reference: <b>' + ticket.reference + '</b> in order to modify the ' + req.body.ticket_type + ' in the future')
                // load ticket view once created
                return res.redirect(req.body.ticket_type + '/' + ticket._id);
            }
        });
    });
};

exports.show = function(req, res) {
    var ticket = req.ticket;
    return res.render('tickets/show', {
        ticket: ticket,
        title: ticket.name,
        ticket_type: req.params.type,
        req: req
    });
};

exports.edit = function(req, res) {
    // Trim the reference body
    var reference = req.body.reference.trim();
    // Use ref to modify directly
    if (typeof(req.params.ticketId) == 'undefined') {
        async.waterfall([
            function(callback) {
                OfferModel.findTicketByReference(reference, function(err, ticket) {
                    if (ticket !== null) {
                        callback(null, ticket);
                    }
                    else {
                        NeedModel.findTicketByReference(reference, function(err, ticket) {
                            if (ticket !== null) {
                                callback(null, ticket);
                            }
                            else {
                                req.flash('warning', 'The reference is not right');
                                return res.render('users/login', {
                                    title: 'Login',
                                    message: req.flash('error'),
                                    req: req
                                });
                            }
                        });
                    }
                });
            }
        ], function(err, ticket) {
            var ticket_type = utils.getTicketType(ticket);
            return res.render('tickets/form', {
                ticket: ticket,
                ticket_type: ticket_type,
                title: ticket.name,
                post_action: (ticket_type + '/' + ticket._id).toString(),
                req: req,
            });
        });
    }
    // Modify -> Auth
    if (typeof(req.ticket) !== 'undefined') {
        var ticket = req.ticket;
        if (reference === req.ticket || req.isAuthenticated()) {
            var ticket_type = utils.getTicketType(ticket);
            return res.render('tickets/form', {
                ticket: ticket,
                ticket_type: ticket_type,
                title: ticket.name,
                post_action: (ticket_type + '/' + ticket._id).toString(),
                req: req,
            });
        }
        else {
            req.flash('warning', 'The reference is not right');
            return res.render('users/login', {
                title: 'Login',
                message: req.flash('error'),
                req: req
            });
        }
    }
};

exports.delete = function(req, res) {
    var ticketToDelete = req.ticket;
    ticketToDelete.desactive(function(err) {
        return res.redirect('/');
    });
}

exports.update = function(req, res) {
    var ticket_type = req.params.type;
    var ticket = req.ticket;
    ticket.update(req.body, function(err) {
        if (!err) {
            return res.redirect('/' + ticket_type + '/' + ticket._id);
        }
        return res.render('tickets/form', {
            error: utils.errors(err.errors),
            ticket: ticket,
            title: ticket.name,
            ticket_type: ticket_type,
            post_action: (ticket_type + '/' + ticket._id).toString(),
            req: req
        });
    });
}

exports.matching = function(req, res) {
    var ticket_type = req.params.type;
    var ticket = req.ticket;
    var m = new MatchingModel({
        source_id: req.params.ticketId,
        source_type: ticket_type,
    });
    m.matchEngine(function(err, results) {
        var render_data = {
            source_ticket: ticket,
            ticket_type: ticket_type,
            matching_results: results,
            title: ticket.name,
            req: req
        };
        return res.render('tickets/matching', render_data);
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
