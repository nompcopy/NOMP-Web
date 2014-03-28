// MatchingModel.js
var utils = require('../lib/utils');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');

var MatchingModelSchema = new Schema({
    source: ObjectId,
    target_type: String,
    results: [{
        result_id: ObjectId,
        result_score: Number
    }]
});


MatchingModelSchema.methods = {
    // First try for a search
    // matchEngine: function(options, cb) {
        // var results = function(cb) {
            // return function(err, data) {
                // var keys = {};
                // var queries = NeedModel.findObjectByKeyword(keys);
                
            // };
    // }
}


// uills functions
function calculateScore(ticket, key) {
    var matching_result = {}
    // We may use a iterator here but is annoying
    // name parse
    var term = ticket.name.match(new RegExp(key, 'ig'));
    var name_frequency = term ? term.length : 0;
    // description parse
    term = ticket.description.match(new RegExp(data.keys, 'ig'));
    var description_frequency = term? term.length : 0;
    matching_result[ticket._id] = name_frequency * 1 + description_frequency * 0.2;

    return matching_result;
}


// Built and exports Model from Schema
mongoose.model('MatchingModel', MatchingModelSchema);
exports.MatchingModel = mongoose.model('MatchingModel');

// Async test
var id = '533183829aa528f022af50a3';
var keys = [];
keys = 'test';
var fields = ['name', 'description'];
var queries = [];

var data = {
    keys: 'test',
    fields: ['name', 'description']
};


// Search the tickets by key word from name and description
function searchEngine(cb) {
async.waterfall([
    // Search name field by keys
    function(callback) {
        console.log('start async task');
        NeedModel.findObjectByKeyword(data.fields[0], data.keys, function(err, name_results) {
            callback(null, name_results);
        });
    },
    // Search description field by keys
    function(name_results, callback) {
        NeedModel.findObjectByKeyword(data.fields[1], data.keys, function(err, description_results) {
            var search_results = utils.union_arrays(name_results, description_results);
            callback(null, search_results);
        });
    },
    // Load tickets and matching the result
    function(search_results, callback) {
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
                    tickets.push(calculateScore(ticket, data.keys));
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

var t = function(err, callback) {
    console.log('callback: ' + callback);
};
searchEngine(t);
