// Base.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// BaseModel schema

var BaseModel = new Schema({
    title : String,
    body  : String
});

mongoose.model('BaseModel', BaseModel);
var BaseModel = exports.BaseModel = mongoose.model('BaseModel');