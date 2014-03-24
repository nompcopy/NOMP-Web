// Need model.js
var mongoose = require('mongoose');
// var extend = require('mongoose-schema-extend');
// var Schema = mongoose.Schema;
var ticketModel = require('./TicketModel');

var NeedModelSchema = ticketModel.TicketModelSchema.extend({ test : String });

// Export Schema
exports.NeedModelSchema = NeedModelSchema
// Build and Export Model
mongoose.model('NeedModel', NeedModelSchema);
var NeedModel = exports.NeedModel = mongoose.model('NeedModel');
