// matches.js
var path = require('path');

var mongoose = require('mongoose');
var utils = require('../lib/utils');

var MatchingModel = mongoose.model('MatchingModel');


exports.matching = function(req, res) {
    var ticket_type = req.params.type;
    var ticket_id = req.params.ticketId;
    // 1. Try to load an existing matching results
    // 2. If not exist, create a new matching results
    MatchingModel.retrieveByTicket(ticket_id, ticket_type, function(err, results) {
        if (err || !results) {
            var m = new MatchingModel({
                source_id: ticket_id,
                source_type: ticket_type
            });
            m.matchEngine(function(err, items) {
                if (items.length == 0) {
                    res.json([]);
                }
                else {
                    m.results = items;
                    m.save(function(err) {
                        if (err) console.log(err);
                        return res.json(m.results);
                    });
                }
            });
        }
        else {
            res.json(results.results);
        }
    });
}


exports.searching = function(req, res) {
    var m = new MatchingModel();
    var query_data = {
        is_match: false,
        keywords: utils.generateKeywords(req.query.keywords),
    };
    m.searchEngine(query_data, function(err, results) {
        // seperate the results into 2 collections: need and offer
        var needs = [];
        var offers = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].ticket.__t === 'NeedModel') {
                needs.push(results[i].ticket);
            } else {
                offers.push(results[i].ticket);
            }
        }
        
        var render_data = {
            matching_results: results,
            searching_results: {'needs': needs, 'offers': offers},
            title: 'Search results of ' + req.query.keywords,
            req: req
        }
        return res.render('tickets/search', render_data);
    });
}
