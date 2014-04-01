/*
 * Express apps
 */

var express = require('express');
var mongoStore = require('connect-mongo')(express)
var flash = require('connect-flash');
var http = require('http');
var path = require('path');
var pkg = require('../package.json')

module.exports = function(app, config, passport) {

    app.set('showStackError', true);

    // set views path, template engine and default layout
    app.set('views', config.root + '/views');
    app.set('view engine', 'jade');
    app.configure(function() {
        app.use(function (req, res, next) {
            res.locals.pkg = pkg;
            next();
        });
    });
    // cookieParser should be above session
    app.use(express.cookieParser());

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // mongo session storage
    app.use(express.session({
        secret: pkg.name,
        store: new mongoStore({
            url: config.db,
            collection: 'sessions'
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash message
    // should be after session
    app.use(flash());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());


    app.use(app.router);
    app.use(express.static(config.root + '/public'));
}