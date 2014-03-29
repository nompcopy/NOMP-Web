// ClassificationModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Target classification of tickets
var ClassificationModelSchema = new Schema({
    name: {type: String},
    super_lever: {type: Schema.ObjectId, ref: 'super_level'},
});


ClassificationModelSchema.statics = {
    list: function (cb) {
        this.find().exec(cb);
    },
};

// Built and exports Model from Schema
mongoose.model('ClassificationModel', ClassificationModelSchema);
exports.ClassificationModel = mongoose.model('ClassificationModel');

