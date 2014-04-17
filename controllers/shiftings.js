// Shifting.js
var path = require('path');
var async = require('async');

var mongoose = require('mongoose');
var utils = require('../lib/utils');
var ParseExcel = mongoose.model('ParseExcel');


exports.import = function(req, res) {
    var file_dir = req.files.file.path;
    var parser = new ParseExcel({
        file: file_dir,
        user: req.user._id
    });
    parser.import();
    return res.redirect('/user/' + req.user._id.toString() + '/ticket');
};

exports.export = function(req, res) {
    var ticket_type = 'offer';
    // make ref
    var ref = utils.makeRef();
    var file_url = '/tmp_files/' + ticket_type + '_' + ref + '_list.xlsx';
    var file_dir = './public/tmp_files/' + ticket_type + '_' + ref + '_list.xlsx';
    var options = {};
    if (!req.session.admin) {
        options.criteria = { user: req.user._id };
    }
    //Make excel file
    var exportation = new ParseExcel({
        file: file_dir,
        ticket_type: ticket_type
    });
    exportation.export(options);
    return res.redirect(file_url);
}