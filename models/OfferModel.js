// OfferModel.js
var mongoose = require('mongoose');
// var extend = require('mongoose-schema-extend');
// var Schema = mongoose.Schema;
var ticketModel = require('./TicketModel');

// TODO: Special fields for Offer
var OfferModelSchema = ticketModel.TicketModelSchema.extend({ test : String });

// Export Schema
exports.OfferModelSchema = OfferModelSchema
// Build and Export Model
mongoose.model('OfferModel', OfferModelSchema);
var OfferModel = exports.OfferModel = mongoose.model('OfferModel');