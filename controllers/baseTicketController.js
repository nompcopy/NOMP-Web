// baseTicketController, require all tickets controllers
var async = require('async');

var ticketEditor = require('./tickets/ticketEditor');
var ticketDisplayer = require('./tickets/ticketDisplayer');
var fieldController = require('./fieldController');

var mongoose = require('mongoose');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');


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

// ticketDisplayer
exports.index = ticketDisplayer.index;
exports.show = ticketDisplayer.show;
exports.list = ticketDisplayer.list;
exports.showJson = ticketDisplayer.showJson;
exports.ownerJsonList = ticketDisplayer.ownerJsonList;

// ticketEditor
exports.new = ticketEditor.new;
exports.create = ticketEditor.create;
exports.edit = ticketEditor.edit;
exports.delete = ticketEditor.delete;
exports.update = ticketEditor.update;

// fieldController
exports.class_list = fieldController.class_list;
exports.class_parent_list = fieldController.class_parent_list;
exports.actor_type_list = fieldController.actor_type_list;
exports.actor_type_parent_list = fieldController.actor_type_parent_list;

// maps
exports.maps = function(req, res) {
    console.log(Object.keys(req));
    res.render('tickets/maps', {
        req: req
    });
}
