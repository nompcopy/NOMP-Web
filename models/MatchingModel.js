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
    // Load tickets
    function(search_results, callback) {
        for (index in search_results) {
            NeedModel.load(search_results[index], function(err, ticket) {
                var tickets = [];
                tickets.push(ticket);
                callback(null, tickets);
            });
        }
    },
    // Search fields
    // Matching result with score = { id, score}
    function(tickets, callback) {
        var matching_results = {}
        for (index in tickets) {
            var ticket = tickets[index];
            // We may use a iterator here but is annoying
            // name parse
            var term = ticket.name.match(new RegExp(data.keys, 'ig'));
            var name_frequency = term ? term.length : 0;
            // description parse
            term = ticket.description.match(new RegExp(data.keys, 'ig'));
            var description_frequency = term? term.length : 0;
            matching_results[ticket._id] = name_frequency * 1 + description_frequency * 0.2;
        }
        callback(null, matching_results);
    },
], function(err, matching_results) {
    console.log(matching_results);
});



// Initial model
// async.waterfall([
    // function(callback) {
        // console.log('start async task');
        // NeedModel.load(id, function(err, need) {
            // callback(null, need)
        // });
    // },
    // function(need, callback) {
        // console.log(need);
    // }
// ]);
