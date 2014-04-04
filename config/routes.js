/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');

var routes = require('../controllers/index');
var tickets = require('../controllers/tickets');
var user = require('../controllers/user');
var auth = require('./middlewares/authorization');

/*
 * Route middlewares
 */
var ticketAuth = [auth.requiresLogin, auth.ticket.hasAuthorization];
/*
 * Routes
 */
module.exports = function (app, passport, config) {
    /*
     * User routes
     */
    app.get('/login', user.login);
    app.get('/signup', user.signup);
    app.get('/logout', user.logout);
    app.post('/user', user.create);
    app.post('/user/session',
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
        }), user.session
    );
    // Social network Login
    app.get('/auth/facebook',
        passport.authenticate('facebook', {
            scope: [ 'email', 'user_about_me'],
            failureRedirect: '/login'
        }), user.signin);
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/login'
        }), user.authCallback);
    app.get('/auth/github',
        passport.authenticate('github', {
            failureRedirect: '/login'
        }), user.signin);
    app.get('/auth/github/callback',
        passport.authenticate('github', {
            failureRedirect: '/login'
        }), user.authCallback);
    app.get('/auth/twitter',
        passport.authenticate('twitter', {
            failureRedirect: '/login'
        }), user.signin);
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: '/login'
        }), user.authCallback)

    app.get('/user/:userId', user.show);
    app.param('userId', user.user);


    /*
     * Ticket routes
     * Use Regex in order to deal with need and offer at same time
     */
    app.get('/', tickets.index);
    app.get('/:type(need|offer)', tickets.index);
    app.get('/:type(need|offer)/list', tickets.list);

    app.get('/:type(need|offer)/new', tickets.new);
    app.post('/:type(need|offer|ticket)/create', tickets.create);

    app.get('/:type(need|offer)/:ticketId', tickets.show);

    app.get('/:type(need|offer)/:ticketId/edit', ticketAuth, tickets.edit);
    // update
    app.put('/:type(need|offer)/:ticketId', ticketAuth, tickets.update);
    app.param('ticketId', tickets.load);

/*
 * Matching and Searching
 */
    app.get('/:type(need|offer)/matching/:ticketId', tickets.matching);
/*
 * Others
 */
    // class list
    app.get('/classification/list', tickets.class_list);
    // actor type list
    app.get('/actortype/list', tickets.actor_type_list);
};
