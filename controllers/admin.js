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
    var tmp_parent_classification = JSON.parse(req.body.parent_classification);
    req.body.parent = tmp_parent_classification.id;
    req.body.parent_name = tmp_parent_classification.name;

    // Update
    if (typeof(req.body.id) !== 'undefined') {
        ClassificationModel.load(req.body.id.toString(), function(err, item) {
            item.parent = tmp_parent_classification.id;
            item.parent_name = tmp_parent_classification.name;
            item.name = req.body.name;
            item.save(function(err) {
                return res.redirect('/admin/classification');
            });
        });
    }
    else {
        var c = new ClassificationModel(req.body);
        c.save(function(err) {
            return res.redirect('/admin/classification');
        });
    }
}

exports.deleteClassification = function(req, res) {
    var id = req.params.classId;
    console.log(id);
    ClassificationModel.load(id, function(err, item) {
        item.remove(function(err) {
            return res.redirect('/admin/classification');
        });
    });
}

exports.editActorType = function(req, res) {

}
