// Need model.js
// Extends TicketModel
var utils = require('../lib/utils');
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');

// var Schema = mongoose.Schema;
var ticketModel = require('./TicketModel');

var NeedModelSchema = ticketModel.TicketModelSchema.extend({
    test_field: String 
});

// Test of adding methods to NeedModel which inherits TicketModelSchema
NeedModelSchema.methods = {
    testFunction : function(cb) {
        console.log('testFunction');
    },
};


// Inherits parent schema's inherits functions
NeedModelSchema.methods = utils.mergeObjects(
    NeedModelSchema.methods, NeedModelSchema.inherits
);
// Export Schema
exports.NeedModelSchema = NeedModelSchema;
// Build and Export Model
mongoose.model('NeedModel', NeedModelSchema);
var NeedModel = exports.NeedModel = mongoose.model('NeedModel');
