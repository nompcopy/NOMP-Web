// Base.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Be careful the order
var UserModel = require('../models/UserModel');
var TicketModel = require('../models/TicketModel');
var NeedModel = require('../models/NeedModel');
var OfferModel = require('../models/OfferModel');
var MatchingModel = require('../models/MatchingModel');
var ActorTypeModel = require('../models/ActorTypeModel');
var ClassificationModel = require('../models/ClassificationModel');
var ParseExcel = require('../lib/ParseExcel');
// BaseModel schema

var BaseModel = new Schema({
    title : String,
    body  : String
});

mongoose.model('BaseModel', BaseModel);
var BaseModel = exports.BaseModel = mongoose.model('BaseModel');