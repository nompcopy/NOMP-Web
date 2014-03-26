// MatchingModel.js
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
    matchEngine: function(options, cb) {
        var keys = {};
        var fields = {};
        NeedModel.findKey(keys, fields).exec(cb);
    }
}


// Built and exports Model from Schema
mongoose.model('MatchingModel', MatchingModelSchema);
exports.MatchingModel = mongoose.model('MatchingModel');

var id = '533183829aa528f022af50a3';
var matching = new this.MatchingModel({
    source: id,
    target_type: 'need',
});
var options = {};
matching.matchEngine(options, function(err, results) {
    console.log('run Engine');
    console.log(results);
});
// Export Schema
// exports.MatchingModelSchema = MatchingModelSchema;
