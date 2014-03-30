// MatchingModel.js
var utils = require('../lib/utils');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var TicketModel = mongoose.model('TicketModel');


var MatchingModelSchema = new Schema({
    source_id: {type: Schema.ObjectId},
    is_match: {type: Boolean, default: true},
    results: [{
        result_id: Schema.ObjectId,
        result_score: Number
    }]
});


/*
    // prepare query data
    var data = {
        keywords: [{type: String}],
        classification: {type: Schema.ObjectId},
        target_actor_type: {type: Schema.ObjectId}
    };
 */
MatchingModelSchema.methods = {
    // TODO: With Matching Engine, we have the possibility of a search advanced
    searchEngine: function(data, cb) {
        var data = {
            // keywords: ['matcher', 'shit', 'need', 'plateform'],
            // is_match: false,
        };
        match(data, cb);
    },
    matchEngine: function(cb) {
        var source_id = this.source_id;
        async.waterfall([
            function(callback) {
                NeedModel.load(source_id, function(err, ticket) {
                    // Prepare data
                    var data = {
                        keywords: ticket.keywords,
                        classification: ticket.classification,
                        target_actor_type: ticket.target_actor_type,
                        is_match: true
                    }
                    callback(null, data);
                });
            },
            function(data, callback) {
                match(data, callback);
            }
        ], cb);
    }
};


function match(data, cb) {
    async.waterfall([
        // Matcher a list of tickets with same classification and target actor type
        function(callback) {
            if (data.is_match) {
                //TODO modify to offermodel
                NeedModel.findIdByActorTypeAndClassification(
                    data.target_actor_type,
                    data.classification, function(err, list) {
                        callback(null, data, list);
                    });
            }
            else {
                callback(null, data, null);
            }
        },
        // Find keywords in the list
        function(data, list, callback) {
            searchKeyWords(data, list, cb);
        }
    ], cb);
}


function searchKeyWords(data, list, cb) {
    var target_list = list || null;
    var results = [];
    async.waterfall([
        // Iterator keys
        function(callback) {
            console.log('Start iteration keys words search');
            var index = 0;
            async.eachSeries(data.keywords, function(keyword, iterator_key_callback) {
                searchKeyWord(keyword, target_list, function(err, one_key_results) {
                    index++;
                    // We only care the final result to call back
                    results.push(one_key_results);
                    if (data.keywords.length == index) {
                        callback(null, results);
                    }
                    
                });
                iterator_key_callback();
            });
        },
        // Add up the scores from results
        function(results, callback) {
            callback(null, mergeResults(results));
        }
    ], cb);
}


// Search the tickets by one key word from name and description
function searchKeyWord(keyword, list, cb) {
    var target_list = list || [];

async.waterfall([
    // Search name field by keys
    function(callback) {
        console.log('Start One Key Word Search');
        NeedModel.findObjectByKeyword('name', keyword, target_list, function(err, name_results) {
            callback(null, name_results);
        });
    },
    // Search description field by key
    function(name_results, callback) {
        NeedModel.findObjectByKeyword('description', keyword, target_list, function(err, description_results) {
            var search_results = utils.union_arrays(name_results, description_results);
            callback(null, search_results);
        });
    },
    // Load tickets and matching the result
    function(search_results, callback) {
        // If no results, callback []
        if (search_results.length == 0) {
            callback(null, search_results);
        }
        // Tickets container
        var tickets = [];
        async.each(search_results, function(search_result, callback1) {
            // Load ticket into search_result
            async.waterfall([
                function(load_ticket) {
                    NeedModel.load(search_result, function(err, ticket) {
                        load_ticket (null, ticket);
                    });
                },
                function(ticket, push_to_array) {
                    // TODO: need optimize, use another async.each to calculate scores and push back
                    tickets.push(calculateScore(ticket, keyword));
                    // We only callback the final result of array push
                    if (tickets.length == search_results.length) {
                        push_to_array (null, tickets);
                    }
                }
            ], function(err, results) {
                // Now we have the final load, callback to higher lever of async
                callback (null, results);
            });
        });
    }
    // handy point to define the final cb function
    // cb = function(err, results) { do the process here};
], cb)}


// uills functions
function calculateScore(ticket, key) {
    var matching_result = {};
    // We may use a iterator here but is annoying
    // name parse
    var term = ticket.name.match(new RegExp(key, 'ig'));
    var name_frequency = term ? term.length : 0;
    // description parse
    term = ticket.description.match(new RegExp(key, 'ig'));
    var description_frequency = term? term.length : 0;
    matching_result= {
        id: ticket._id,
        score: name_frequency * 1 + description_frequency * 0.2
    };

    return matching_result;
}


// Merge results double array into one array and add up the scores
function mergeResults(results) {
    // I tried to do this recursively but I'm stupid
    var arr = [];
    // Merge arrays
    for (var global_index=0; global_index<results.length; global_index++) {
        for (var index=0; index<results[global_index].length; index++) {
            var result = results[global_index][index];
            arr.push(result);
        }
    }

    var ids = [];
    // get list of ids
    for (var index=0; index<arr.length; index++) {
        if (!ids.contains(arr[index].id)) {
            ids.push(arr[index].id);
        }
    }

    // initial new result array by list of ids
    var new_result = [];
    for (var index=0; index<ids.length; index++) {
        new_result.push({
            id: ids[index],
            score: 0
        });
    }
    // Add up the score from old results, unique the array
    for (var id_index=0; id_index<new_result.length; id_index++) {
        for (var index=0; index<arr.length; index++) {
            if (new_result[id_index].id.toString() === arr[index].id.toString()) {
                new_result[id_index].score += arr[index].score;
            }
        }
    }

    return new_result;
}


// Built and exports Model from Schema
mongoose.model('MatchingModel', MatchingModelSchema);
exports.MatchingModel = mongoose.model('MatchingModel');
