// tickets.js
/*
 * GET ticket home page.
 */
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
    res.render('index', { title: 'Welcome Ticket!' });
};

exports.show = function(req, res) {
    res.render('index', { title: 'Welcome Ticket!' });
};

exports.edit = function(req, res) {
    res.render('index', { title: 'Welcome Ticket!' });
};

