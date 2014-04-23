// ticketEditor, create, edit, update, delete
var utils = require('../../lib/utils');
var ticketUtils = require('./ticketUtils');

var path = require('path');
var async = require('async');

var mongoose = require('mongoose');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var UserModel = mongoose.model('UserModel');

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
    req = ticketUtils.feedClassAndActorType(req);

    if (req.body.ticket_type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.body.ticket_type === 'offer') {
        var ticket = new OfferModel(req.body);
    }

    // fetch class, actorType names
    async.waterfall([
        // associate image temp path
        function(callback) {
            for (var index=0; index<req.files.image[0].length; index++) {
                if (req.files.image[0][index].size > 0) {
                    ticket.media.image.push(req.files.image[0][index].path);
                }
            }
            callback(null, ticket);
        },
        // associate user if req is authenticated
        function(ticket, callback) {
            if (req.isAuthenticated()) {
                ticket.user = req.user._id;
                ticket.source_actor_type = req.user.actor_type;
                ticket.source_actor_type_name = req.user.actor_type_name;
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
                req.flash('info', 'Please remember this reference: <b>' + ticket.reference + '</b> in order to modify the ' + req.body.ticket_type + ' in the future');
                if (!req.isAuthenticated()) {
                    req.session.ticket = ticket;
                    // TODO: with a form
                    var signup_link = '<a href="/signup"><b>Sign up</b></a>';
                    var login_link = '<a href="/login"><b>Login</b></a>';
                    req.flash('info', 'Or do you want to ' + signup_link + ' or ' + login_link + '?');
                }
                // load ticket view once created
                return res.redirect(req.body.ticket_type + '/' + ticket._id);
            }
        });
    });
};


exports.edit = function(req, res) {
    if (typeof(req.body.reference) !== 'undefined') {
        // Trim the reference body
        var reference = req.body.reference.trim();
    }
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
                                //req.flash('warning', 'The reference is not right');
                                return res.render('users/login', {
                                    title: 'Login',
                                    //message: req.flash('error'),
                                    message: 'The reference is not right',
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
        if (reference === req.ticket.reference || req.isAuthenticated()) {
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
    if (typeof(req.files.image) !== 'undefined') {
        req.body.media = {};
        req.body.media.image = [];
        for (var index=0; index<req.files.image[0].length; index++) {
            if (req.files.image[0][index].size > 0) {
                req.body.media.image.push(req.files.image[0][index].path);
            }
        }
    }

    req = ticketUtils.feedClassAndActorType(req);
    req.body.update_date = Date.now();
    ticket.update(req.body, function(err) {
        if (!err) {
            return res.redirect('/' + ticket_type + '/' + ticket._id);
        }
        console.log(err);
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