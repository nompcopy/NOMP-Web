// OfferModel.js
var utils = require('../lib/utils');

var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ticketModel = require('./TicketModel');

// TODO: Special fields for Offer
var OfferModelSchema = ticketModel.TicketModelSchema.extend({
    cost : {type: Number},
});

OfferModelSchema.methods = {
    testFunction: function(cb){
        console.log('test function');
    }
};


// Inherits parent schema's inherits functions
OfferModelSchema.methods = utils.mergeObjects(
    OfferModelSchema.methods, OfferModelSchema.inherits
);
// Export Schema
exports.OfferModelSchema = OfferModelSchema
// Build and Export Model
exports.OfferModel = mongoose.model('OfferModel', OfferModelSchema);
