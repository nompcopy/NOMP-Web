// Shifting.js
var path = require('path');
var async = require('async');

var mongoose = require('mongoose');
var utils = require('../lib/utils');
var ParseExcel = mongoose.model('ParseExcel');

exports.import = function(req, res) {
    console.log(req.files.file.path);
    var file_dir = req.files.file.path;
    console.log(file_dir);
    var parser = new ParseExcel({
        file: file_dir,
        user: req.user._id
    });
    parser.import();
    return res.redirect('/user/' + req.user._id.toString() + '/ticket');
};