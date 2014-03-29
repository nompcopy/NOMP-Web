// ActorTypeModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// 
var ActorTypeModelSchema = new Schema({
    name: {type: String},
});


ActorTypeModelSchema.statics = {
    list: function (cb) {
        this.find().exec(cb);
    },
};


// Built and exports Model from Schema
mongoose.model('ActorTypeModel', ActorTypeModelSchema);
exports.ActorTypeModel = mongoose.model('ActorTypeModel');
