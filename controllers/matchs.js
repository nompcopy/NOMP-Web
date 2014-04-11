// matches.js
var path = require('path');

var mongoose = require('mongoose');
var utils = require('../lib/utils');

var MatchingModel = mongoose.model('MatchingModel');


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

exports.searching = function(req, res) {
    var m = new MatchingModel();
    var query_data = {
        is_match: false,
        keywords: utils.generateKeywords(req.query.keywords),
    };
    m.searchEngine(query_data, function(err, results) {
        var render_data = {
            matching_results: results,
            title: 'Search results of ' + req.query.keywords,
            req: req
        }
        return res.render('tickets/matching', render_data);
    });
}
