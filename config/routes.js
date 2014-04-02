/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');

var routes = require('../controllers/index');
var tickets = require('../controllers/tickets');
var user = require('../controllers/user');

module.exports = function (app, passport, config) {
    app.get('/', routes.index);
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

    app.param('userId', user.user)


/*
 * Ticket routes
 * Use Regex in order to deal with need and offer at same time
 */
    // app.get('/ticket', tickets.index);
    app.get('/:type(need|offer|ticket)', tickets.index);
    app.get('/:type(need|offer)/list', tickets.list);

    app.get('/:type(need|offer)/new', tickets.new);
    app.post('/:type(need|offer|ticket)/create', tickets.create);

    app.get('/:type(need|offer)/:id', tickets.show);

    app.get('/:type(need|offer)/:id/edit', tickets.edit);
    // update
    app.put('/:type(need|offer)/:id', tickets.update);

/*
 * Matching and Searching
 */
    app.get('/:type(need|offer)/matching/:id', tickets.matching);
/*
 * Others
 */
    // class list
    app.get('/classification/list', tickets.class_list);
    // actor type list
    app.get('/actortype/list', tickets.actor_type_list);
};
