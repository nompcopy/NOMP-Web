// Ticket.js
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


// TicketModel schema
var TicketModelSchema = new Schema({
    name: {type: String, default: '', trim: true},
    class: {
        class_id: {type: Number}, // TODO: new class model
        class_name: {type: String, trim: true}
    },
    actor_type: {
        actorType_id: {type: Number},
        actorType_name: {type: String, trim: true}
    },
    contact: {
        phone: {type: String},
        mobile: {type: String},
        email: {type: String}
    },
    cost: {}, // TODO: need confirmation
    description: {type: String, default: '', trim: true},
    dates: {
        creation_date: {type: Date, default: Date.now},
        end_date: {type: Date, default: addDate()},
        start_date: {type: Date, default: Date.now},
        expiration_date: {type: Date, default: addDate}
    },

    is_active: {type: Number, default: 1},
    reference: {type: String}
    // TODO: reference to User
});


/**
 * Validations
 */
// Fields to validate
var errorCount = 0;
var validate_fields = [
    {'name': [
        { 'max_length': 50 },
        { 'require': true }
    ]},
    {'description': [
        { 'max_length': 144 },
        { 'require': true }
    ]}
];
validate_fields.forEach(function(field_datas) {
    for (field in field_datas) {
        field_datas[field].forEach(function(data) {
            for (rule in data) {
                if (rule === 'require') {
                    TicketModelSchema.path(field).required(data[rule], field + ' cannot be blank');
                }
                else if (rule === 'max_length') {
                    // TODO
                }
            };
        });
    }
});


/**
 * Methods
 */
TicketModelSchema.methods = {
    creatAndSave: function (cb) {
        this.save(cb);
    }
};


/**
 * Statics
 */
TicketModelSchema.statics = {

    // Find ticket by id
    // TODO: .populate('_user');
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },

    // List articles
    // TODO: pagination, populate(_user)
    list: function (options, cb) {
        var criteria = options.criteria || {};

        this.find(criteria).exec(cb);
    }
}

// TODO: Add this in lib/utils.js
function addDate() {
    var now = new Date()
    var dt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    return dt;
}

mongoose.model('TicketModel', TicketModelSchema);
var TicketModel = exports.TicketModel = mongoose.model('TicketModel');