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
    ClassificationModel.list(function(err, list) {
        if (!err) {
            return res.render('admin/classification', {
                title: 'Edit Classification',
                classifications: list,
                req: req
            });
        }
    });
}

exports.actorType = function(req, res) {
    ActorTypeModel.list(function(err, list) {
        return res.render('admin/actortype', {
            title: 'Edit Actor Type',
            actortypes: list,
            req: req
        });
    });
}

exports.editClassification = function(req, res) {

}

exports.editActorType = function(req, res) {

}
