// field Controller
var mongoose = require('mongoose');
var utils = require('../lib/utils');

var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');

exports.class_list = function(req, res) {
    var options = {};
    if (req.query.parentclass) {
        options.criteria = { parent: req.query.parentclass }
    }
    ClassificationModel.listToJson(options, function(err, items) {
        res.json(items);
    });
}

exports.class_parent_list = function(req, res) {
    ClassificationModel.parentListToJson(function(err, items) {
        res.json(items);
    });
}

exports.actor_type_list = function(req, res) {
    var options = {};
    if (req.query.parentactortype) {
        options.criteria = { parent: req.query.parentactortype };
    }
    ActorTypeModel.listToJson(options, function(err, items) {
        res.json(items);
    });
}

exports.actor_type_parent_list = function(req, res) {
    ActorTypeModel.parentListToJson(function(err, items) {
        res.json(items);
    });
}

exports.get_class = function(req, res) {
    ClassificationModel.loadJson(req.params.classId, function(err, item) {
        res.json(item);
    });
}

exports.get_actor_type = function(req, res) {
    ActorTypeModel.loadJson(req.params.actortypeId, function(err, item) {
        res.json(item);
    });
}