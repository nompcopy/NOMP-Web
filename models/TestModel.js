// Test.js
var fs = require('fs');
var utils = require('../lib/utils');
var xlsx = require('node-xlsx');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Target classification of tickets
var TestModelSchema = new Schema({
    id_str: {type: String},
    from_user: {type: String},
    text: {type: String},
    created_at: {type: String},
    time: {type: String},
    geo_coordinqtes: {type: String},
    user_lang: {type: String},
    in_reply_to_user_id_str: {type: String},
    in_reply_to_screen_name: {type: String},
    from_user_id_str: {type: String},
    in_reply_to_status_id_str: {type: String},
    source: {type: String},
    profile_image_url: {type: String},
    user_followers_count: {type: String},
    user_friends_count: {type: String},
    user_utc_offset: {type: String},
    status_url: {type: String},
    entities_str: {type: String}
});

// Built and exports Model from Schema
mongoose.model('TestModel', TestModelSchema);
exports.TestModel = mongoose.model('TestModel');

var file = './New_for_tweets_export.xlsx';
var obj = xlsx.parse(file);
var data = obj.worksheets[0].data

for (var index=0; index<data.length; index++) {
    if (index == 0) {
        continue;
    }
    var row = data[index]
    var obj = {};
    obj.id_str = row[0].value;
    obj.from_user = row[1].value;
    obj.text = row[2].value;
    obj.created_at = row[3].value;
    obj.time = row[4].value;
    obj.geo_coordinates = row[5].value;
    obj.user_lang = row[6].value;
    obj.in_reply_to_user_id_str = row[7].value;
    obj.in_reply_screen_name = row[8].value;
    obj.from_user_id_str = row[9].value;
    obj.in_reply_to_status_id_str = row[10].value;
    obj.source = row[11].value;
    obj.profile_image_url = row[12].value;
    obj.user_followers_count = row[13].value;
    obj.user_friends_count = row[14].value;
    obj.user_utc_offset = row[15].value;
    obj.status_url = row[16].value;
    obj.entities_str = row[17].value;
    var n = new this.TestModel(obj);
    n.save(function(err) {
        if (err) console.log(err);
        console.log('saved');
    });
}