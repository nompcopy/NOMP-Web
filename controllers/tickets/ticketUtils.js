// utils
var mongoose = require('mongoose');
var gm = require('googlemaps');

var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');


exports.feedTicketJsonList = function(req, options, cb) {
    if (req.params.type == 'need') {
        NeedModel.listToJson(options, cb);
    }
    else if (req.params.type == 'offer') {
        OfferModel.listToJson(options, cb);
    }
}


exports.feedOwnerJsonList = function(req, options, cb) {
    var userOptions = options;
    userOptions.criteria.user = req.user._id;

    if (req.params.type === 'need') {
        NeedModel.listToJson(userOptions, cb);
    }
    else if (req.params.type === 'offer') {
        OfferModel.listToJson(userOptions, cb)
    }
}


exports.feedClassAndActorType = function(req) {
    // Sanitization of req.body, fetch class and actor_type
    var tmp_classification = JSON.parse(req.body.classification);
    req.body.classification = tmp_classification.id;
    req.body.classification_name = tmp_classification.name;

    var tmp_target_actor_type = JSON.parse(req.body.target_actor_type);
    req.body.target_actor_type = tmp_target_actor_type.id;
    req.body.target_actor_type_name = tmp_target_actor_type.name;

    // fetch actor type
    if (req.isAuthenticated() && !req.session.admin) {
        req.body.source_actor_type = req.user.actor_type;
        req.body.source_actor_type_name = req.user.actor_type_name;
    }
    else {
        // TODO: public actor type
        // TODO: optimize this shit
        req.body.source_actor_type = '5336b94ac1bde7b41d90377a';
        req.body.source_actor_type_name = 'Public actor type';
    }
    return req;
}

exports.fetchGeocode = function(ticket, is_update) {
    if (is_update) {
        getGeocode(ticket);
    }
    else {
        if (ticket.geometry) {
            // Do nothing
        }
        else {
            getGeocode(ticket);
        }
    }
}


function getGeocode(ticket) {
    // Add geometry code only if saved successfully
    // But not async (according to the delay of google map API)
    gm.geocode(ticket.address, function(err, result) {
        if (result) {
            ticket.geometry = result.results[0].geometry.location;
            ticket.save();
        }
        else {
            console.log("Warning: the geometry is not found");
        }
    }, false);
}