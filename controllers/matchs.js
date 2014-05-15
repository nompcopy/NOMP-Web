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
        keywords: utils.generateKeywords(req.query.keywords, ''),
        is_admin: false
    };
    // prepare target_actor_type
    // TODO: this is considered as public
    var target_actor_type = [];
    if (req.isAuthenticated() && req.session.admin) {
        query_data.is_admin = true;
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

exports.list = function(req, res) {
    MatchingModel.list(function(err, data) {
        if (req.query.graph == 'true') {
            // format data to adapt graph
            var list = {nodes: [], edges: [], width: 0, height: 0};
            
            // bounding of the graph
            var minLat = 90;
            var maxLat = 0;
            var minLng = 180;
            var maxLng = 0;
            
            // counting of nodes and edges
            var nodesCount = 0;
            var edgesCount = 0;
            
            // map ticket id with node id
            var ticketsNodesMapping = {};
            
            async.eachSeries(data, function(matchingResult, callback) {
                var model = matchingResult.source_type == 'need' ? NeedModel : OfferModel;
                model.load(matchingResult.source_id, function(err, sourceTicket) {
                    if (!sourceTicket) {
                        callback('Source ticket not found');
                    } else {
                        // source node id for building edges
                        var sourceNodeId = nodesCount;
                        
                        if (ticketsNodesMapping[matchingResult.source_id] === undefined) {
                            // resize the bounding of the graph if necessary
                            if (Math.abs(sourceTicket.geometry.lat) < Math.abs(minLat)) {
                                minLat = sourceTicket.geometry.lat;
                            } else if (Math.abs(sourceTicket.geometry.lat) > Math.abs(maxLat)) {
                                maxLat = sourceTicket.geometry.lat
                            }
                            
                            if (Math.abs(sourceTicket.geometry.lng) < Math.abs(minLng)) {
                                minLng = sourceTicket.geometry.lng;
                            } else if (Math.abs(sourceTicket.geometry.lng) > Math.abs(maxLng)) {
                                maxLng = sourceTicket.geometry.lng
                            }
                            
                            // add a node representing the source ticket
                            list.nodes.push({
                                id: 'n' + nodesCount,
                                label: sourceTicket.name,
                                x: sourceTicket.geometry.lng,
                                y: sourceTicket.geometry.lat,
                                size: matchingResult.results.length
                            });
                            
                            // map the ticket id with the position of the ticket in the nodes list
                            ticketsNodesMapping[matchingResult.source_id] = nodesCount;
                            
                            // count nodes for next node id
                            nodesCount++;
                        } else {
                            // mark the mapped index of the ticket
                            sourceNodeId = ticketsNodesMapping[matchingResult.source_id];
                        }
                        
                        for (var j = 0; j < matchingResult.results.length; j++) {
                            var matchedTicket = matchingResult.results[j].ticket;
                            
                            // target node id for building edges
                            var targetNodeId = nodesCount;
                            
                            if (ticketsNodesMapping[matchedTicket._id] === undefined) {
                                // resize the bounding of the graph if necessary
                                if (Math.abs(matchedTicket.geometry.lat) < Math.abs(minLat)) {
                                    minLat = matchedTicket.geometry.lat;
                                } else if (Math.abs(matchedTicket.geometry.lat) > Math.abs(maxLat)) {
                                    maxLat = matchedTicket.geometry.lat
                                }
                                
                                if (Math.abs(matchedTicket.geometry.lng) < Math.abs(minLng)) {
                                    minLng = matchedTicket.geometry.lng;
                                } else if (Math.abs(matchedTicket.geometry.lng) > Math.abs(maxLng)) {
                                    maxLng = matchedTicket.geometry.lng
                                }
                                
                                // add a node representing the target ticket of matching
                                list.nodes.push({
                                    id: 'n' + nodesCount,
                                    label: matchedTicket.name,
                                    x: matchedTicket.geometry.lng,
                                    y: matchedTicket.geometry.lat,
                                    size: 1
                                });
                                
                                // map the ticket id with the position of the ticket in the nodes list
                                ticketsNodesMapping[matchedTicket._id] = nodesCount;
                                
                                // count nodes for next node id
                                nodesCount++;
                            } else {
                                // mark the mapped index of the target ticket
                                targetNodeId = ticketsNodesMapping[matchedTicket._id];
                                
                                // enlarge the size of node representing the frequency of relations
                                list.nodes[targetNodeId].size++;
                            }
                            
                            // build an edge
                            list.edges.push({
                                id: 'e' + edgesCount,
                                source: 'n' + sourceNodeId,
                                target: 'n' + targetNodeId
                            });
                            
                            // count edges for next edge id
                            edgesCount++;
                        }
                        callback(null);
                    }
                });
            }, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    // set the counting
                    list.nb_nodes = nodesCount;
                    list.nb_edges = edgesCount;
                    
                    // sign the origin of graph
                    list.origin = {lat: minLat, lng: minLng};
                    
                    // compute width and height of graph
                    list.width = utils.getDistance(list.origin, {lat: minLat, lng: maxLng});
                    list.height = utils.getDistance(list.origin, {lat: maxLat, lng: minLng});
                    
                    // convert geocode to graph coordinates (x,y)
                    async.each(list.nodes, function(node, callback) {
                        var xy = utils.geocode2xy({lat: node.y, lng: node.x}, list.origin);
                        node.x = xy.x;
                        node.y = xy.y;
                        callback(null);
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(list);
                            res.json(list);
                        }
                    });
                }
            });
        } else {
            res.json(data);
        }
    });
}

function pushTicketIntoNodeList(ticket, nodeList) {
    
}

function mapTicketIdWithNodeId(ticketsNodesMapping, ticketId, nodeId) {
    
}
