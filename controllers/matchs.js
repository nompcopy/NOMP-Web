// matches.js
var path = require('path');
var async = require('async');
var mongoose = require('mongoose');
var utils = require('../lib/utils');

var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
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


exports.confirm = function(req, res) {
    // TODO: calculate quantities and remove from matching and results

    // Target ticket status
    // Delete target item from source matching results
    // MatchingModel.retrieveByTicket(req.body.source_id, req.body.source_type, function(err, matching_results) {
        // var item_index = utils.findItemIndexInArray(req.body.id, matching_results.results);
        // matching_results.results.splice(item_index, 1);
        // matching_results.save(function(err) {
            // if (err) console.log(err);
        // });
    // });
    if (req.body.ticket_type == 'need') {
        NeedModel.load(req.body.id, function(err, ticket) {
            if (err) console.log(err);
            ticket.statut = 1;
            if (ticket.matched.contains(req.body.source_id)) {
            }
            else {
                ticket.matched.push(req.body.source_id);
            }
            ticket.save(function (err) {
                if (err) console.log(err);
            });
        });
    }
    else {
        OfferModel.load(req.body.id, function(err, ticket) {
            if (err) console.log(err);
            ticket.statut = 1;
            if (ticket.matched.contains(req.body.source_id)) {
            }
            else {
                ticket.matched.push(req.body.source_id);
            }
            ticket.save(function (err) {
                if (err) console.log(err);
            });
        });
    }

    // Source ticket status
    if (req.body.source_type == 'need') {
        NeedModel.load(req.body.source_id, function(err, ticket) {
            if (err) console.log(err);
            ticket.statut = 1;
            if (ticket.matched.contains(req.body.source_id)) {
            }
            else {
                ticket.matched.push(req.body.source_id);
            }
            ticket.save(function (err) {
                if (err) console.log(err);
            });
        });
    }
    else {
        OfferModel.load(req.body.source_id, function(err, ticket) {
            if (err) console.log(err);
            ticket.statut = 1;
            if (ticket.matched.contains(req.body.source_id)) {
            }
            else {
                ticket.matched.push(req.body.source_id);
            }
            ticket.save(function (err) {
                if (err) console.log(err);
            });
        });
    }
    return res.redirect('/' + req.body.source_type + '/' + req.body.source_id.toString());
}


exports.matching_update = function(req, res) {
    MatchingModel.list(function(err, list) {
        if (err) {
            console.log(err);
        }
        else {
            async.each(list, function(m, iterator_callback) {
                m.matchEngine(function(err, items) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        m.results = items;
                        m.save(function(err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log('Matching: ' + m._id + ' updated');
                            }
                        });
                    }
                });
                iterator_callback();
            });
        }
    });
    res.redirect('/');
}

exports.searching = function(req, res) {
    var m = new MatchingModel();

    var query_data = {
        is_match: false,
        keywords: utils.generateKeywords(req.query.keywords),
    };
    // prepare target_actor_type
    // TODO: this is considered as public
    var target_actor_type = [];
    if (req.isAuthenticated() && req.session.admin) {
        // Do nothing
    }
    else if (req.isAuthenticated()) {
        target_actor_type.push('5336b94ac1bde7b41d90377a');
        if (typeof(req.user.actor_type) !== 'undefined') {
            target_actor_type.push(req.user.actor_type);
        }
    }
    else {
        target_actor_type.push('5336b94ac1bde7b41d90377a');
    }
    query_data.target_actor_type = target_actor_type;

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
