// admin controller
// manage class, actor type and users
var utils = require('../lib/utils');

var mongoose = require('mongoose');
var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');


exports.index = function(req, res) {
    return res.render('admin/index', {
        title: 'Admin backend',
        req: req
    })
}

exports.classification = function(req, res) {

}

exports.actorType = function(req, res) {

}

exports.editClassification = function(req, res) {

}

exports.editActorType = function(req, res) {

}
