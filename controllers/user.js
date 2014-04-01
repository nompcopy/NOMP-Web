// user controller
var utils = require('../lib/utils');

var mongoose = require('mongoose');
var UserModel = mongoose.model('UserModel');

var login = function(req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}

/*
 * Sign in route
 */
exports.signin = function() {};


/*
 * Auth callback
 */
exports.authCallback = login

/*
 * Show login form
 */
exports.login = function(req, res) {
    res.render('users/login', {
        title: 'Login',
        message: req.flash('error')
    });
}

/*
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new UserModel()
    });
}

/*
 * Logout
 */
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/login');
}

/*
 * Session
 */
exports.session = login


/*
 * Create new user
 */
exports.create = function(req, res) {
    var user = new UserModel(req.body);
    user.provider = 'local'
    user.save(function(err) {
        if (err) {
            console.log(err);
            return res.render('users/signup', {
                error: utils.errors(err.errors),
                user: user,
                title: 'Sign up'
            });
        }
        else {
            // Login the user once signed up
            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                return res.redirect('/');
            });
        }
    });
}


/*
 * Show profile
 */
exports.show = function(req, res) {
    var user = req.profile
    res.render('users/show', {
        title: user.name,
        user: user
    });
}


/*
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    UserModel
        .findOne({ _id: id })
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(new Error('Failed to load User ' + id));
            }
            req.profile = user;
            next();
        });
}


/*
 * TODO: RESTful GET users listing.
 */
exports.list = function(req, res){
  res.send("respond with a resource");
};