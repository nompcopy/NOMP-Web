/*
 * Expose routes
 */
var path = require('path');
var mongoose = require('mongoose');

// var routes = require('../controllers/index');
var tickets = require('../controllers/tickets');
var user = require('../controllers/user');
var matchs = require('../controllers/matchs');
var shiftings = require('../controllers/shiftings');
var admin = require('../controllers/admin');
var auth = require('./middlewares/authorization');

/*
 * Route middlewares
 */
var adminAuth = [auth.requiresLogin, auth.user.isAdmin];
var listAuth = [auth.requiresLogin];
var globalAuth = [auth.requiresLogin];
var ticketAuth = [auth.requiresLogin, auth.ticket.hasAuthorization];
var cleanReturnUrl = [auth.clearReturnTo];
/*
 * Routes
 */
module.exports = function (app, passport, config) {
    /*
     * Admin routes
     */
    app.get('/admin*', adminAuth);
    app.get('/admin', admin.index);
    // manage class and actor type
    app.get('/admin/classification', admin.classification);
    app.get('/admin/actortype', admin.actorType);
    app.put('/admin/classification', admin.editClassification);
    app.put('/admin/actortype', admin.editActorType);
    app.delete('/admin/classification/delete/:classId', admin.deleteClassification);
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
    // edit profile block
    app.get('/user/:userId/edit', globalAuth, user.edit);
    // app.post('/user/:userId/edit', user.edit);
    app.put('/user/:userId', user.update);

    /*
     * Forgot password
     */
    app.get('/account/forgetpasswordform', user.forgetPasswordForm);
    app.post('/account/forgetpassword', user.forgetPasswordSend);
    app.get('/account/resetpasswordform', user.resetPasswordForm);
    app.post('/account/resetpassword', user.resetPasswordSend);

    /*
     * RESTful list (ticket, users)
     */
    // All list without inactive tickets
    app.get('/:type(need|offer)/list', tickets.list);
    // User owns list RESTful
    app.get('/user/:type(need|offer)/list', listAuth, tickets.ownerJsonList);
    // User owns list display
    app.get('/user/:userId/ticket', listAuth, user.ownerList);


    /*
     * Ticket routes
     * Use Regex in order to deal with need and offer at same time
     */
    app.get('/', cleanReturnUrl, tickets.index);
    app.get('/:type(need|offer)', cleanReturnUrl, tickets.index);

    app.get('/:type(need|offer)/new', cleanReturnUrl, tickets.new);
    app.post('/:type(need|offer|ticket)/create', tickets.create);

    app.get('/:type(need|offer)/:ticketId', tickets.show);
    app.get('/:type(need|offer)/:ticketId/json', tickets.showJson);
    app.param('ticketId', tickets.load);

    app.post('/ticket/edit', tickets.edit)
    app.post('/:type(need|offer)/:ticketId/edit', tickets.edit);
    app.delete('/:type(need|offer)/:ticketId/delete', ticketAuth, tickets.delete);
    app.get('/:type(need|offer)/:ticketId/edit', ticketAuth, tickets.edit);
    // update
    app.put('/:type(need|offer)/:ticketId', tickets.update);

/*
 * Matching and Searching
 */
    app.get('/:type(need|offer)/matching/:ticketId', matchs.matching);
    app.get('/search', matchs.searching);
    app.post('/matching/confirm', matchs.confirm);
    // I just left this routes for execute script, we run it after the environment is done
    app.get('/matching/update', matchs.matching_update);
/*
 * Import and Export
 */
    app.post('/import', shiftings.import);
    app.get('/export', shiftings.export);

/*
 * Others
 */
    // class list
    app.get('/classification/list', tickets.class_list);
    app.get('/classification/parentlist', tickets.class_parent_list);
    // actor type list
    app.get('/actortype/list', tickets.actor_type_list);
    
    // section of geomaps, development only for now
    if ('development' == app.get('env')) {
        app.get('/maps', tickets.maps)
    }
};
