/*
 * Express apps
 */

var express = require('express');
var http = require('http');
var path = require('path');
var pkg = require('../package.json')

module.exports = function(app, config) {

    app.set('showStackError', true);
    app.set('port', process.env.PORT || 3000);

    // set views path, template engine and default layout
    app.set('views', config.root + '/views');
    app.set('view engine', 'jade');
    app.configure(function() {
        app.use(function (req, res, next) {
            res.locals.pkg = pkg;
            next();
        });
    });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(config.root + '/public'));
}