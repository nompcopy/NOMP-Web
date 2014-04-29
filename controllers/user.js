// user controller
var utils = require('../lib/utils');
var mailer = require('../lib/mailer');

var mongoose = require('mongoose');
var UserModel = mongoose.model('UserModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');


var login = function (req, res) {
    // hack the passport user
    handleAssociation(req, req.session.passport.user);
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo)
        delete req.session.returnTo
        return
    }
    res.redirect('/')
};

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
        message: req.flash('error'),
        req: req
    });
}

/*
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new UserModel(),
        post_action: '/user',
        req: req
    });
}

/*
 * Logout
 */
exports.logout = function(req, res) {
    req.session.returnTo = null;
    req.session.admin = false;
    req.logout();
    res.redirect('/');
}

/*
 * Session
 */
exports.session = login


/*
 * Create new user
 */
exports.create = function(req, res) {
    // fetch actor_type
    var tmp_actor_type = JSON.parse(req.body.actor_type);
    req.body.actor_type = tmp_actor_type.id;
    req.body.actor_type_name = tmp_actor_type.name;

    var user = new UserModel(req.body);
    user.provider = 'local';

    user.save(function(err) {
        if (err) {
            console.log(err);
            return res.render('users/signup', {
                error: utils.errors(err.errors),
                user: user,
                title: 'Sign up',
                req: req
            });
        }
        else {
            // Associate the latest ticket
            handleAssociation(req, user._id);
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
 * Edit User profil
 */
exports.edit = function(req, res) {
    res.render('users/signup', {
        title: 'Modify your profile',
        user: req.user,
        post_action: '/user/' + req.user._id.toString(),
        req: req
    });
}

/*
 *
 */
exports.update = function(req, res) {
    // fetch actor type
    var tmp_actor_type = JSON.parse(req.body.actor_type);
    req.body.actor_type = tmp_actor_type.id;
    req.body.actor_type_name = tmp_actor_type.name;

    // If password bloc is touched
    if (req.body.old_password || req.body.new_password || req.body.confirm_password) {
        // validate old password
        if (req.user.authenticate(req.body.old_password)) {
            if ((req.body.new_password == req.body.confirm_password) && req.body.new_password.length > 0) {
                req.body.password = req.body.new_password;
            }
            else {
                req.flash('warning', 'Confirmation of new password not right');
                return res.render('users/signup', {
                    title: 'Modify your profile',
                    user: req.user,
                    post_action: '/user/' + req.user._id.toString(),
                    req: req
                });
            }
        }
        else {
            req.flash('warning', 'The password is not right')
            return res.render('users/signup', {
                title: 'Modify your profile',
                user: req.user,
                post_action: '/user/' + req.user._id.toString(),
                req: req
            });
        }
    }
    req.user.update(req.body, function(err) {
        if (!err) {
            return res.redirect('/user/' + req.user._id.toString());
        }
        req.flash('warning', utils.errors(err.erros));
        return res.render('users/signup', {
            user: req.user,
            title: 'Modify your profile',
            post_action: '/user/' + req.user._id.toString(),
            req: req
        });
    });
}
/*
 * Show profile
 */
exports.show = function(req, res) {
    var user = req.profile
    res.render('users/show', {
        title: user.name,
        user: user,
        req: req
    });
}


exports.forgetPasswordForm = function(req, res) {
    return res.render('users/forgetpassword', {
        title: 'Forgot your password ?',
        req: req
    });
}

exports.forgetPasswordSend = function(req, res) {
    var render_data = {
                title: 'Forgot your password ?',
                // error: 'Email account not found',
                req: req
    };
    UserModel.retrieveByEmail(req.body.email, function(err, user) {
        if (!user) {
            render_data.error = 'Email account not found';
            return res.render('users/forgetpassword', render_data);
        }
        else {
            var mailOptions = {
                from: "NOMP Web <no-reply@nompweb.com>", // sender address
                to: req.body.email, // list of receivers
                subject: "Reset your password in NOMP", // Subject line
            }
            mailOptions.text = "Hello,\nYou can reset your password from the link below:\n";
            mailOptions.text += "http://localhost:3000/account/resetpasswordform";
            mailOptions.text += "?email=" + user.email;
            mailOptions.text += "&key=" + user.hashed_password;
            mailOptions.text += "&date=" + new Date().getTime();
            mailOptions.text += "\nBest Regards\nNOMP Group";
            mailer.smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) {
                    console.log(error);
                    render_data.error = error;
                    return res.render('users/forgetpassword', render_data);
                }
                else {
                    console.log("Message sent: " + response.message);
                    render_data.title = 'Email Sent';
                    render_data.message = 'Email Sent to <' + req.body.email + '>. Please check your mail';
                    return res.render('users/forgetpassword', render_data);
                }
            });
        }
    });
}

exports.resetPasswordForm = function(req, res) {
    var render_data = {
                title: 'Reset your password',
                // error: 'Email account not found',
                req: req
    };

    if (req.query.date && (new Date().getTime() - req.query.date) > 24*60*60*1000) {
        render_data.message = 'The request is expired.';
        return res.render('users/resetpassword', render_data);
    }

    if (req.query.email && req.query.key) {
        UserModel.retrieveByEmailAndHashedPassword(req.query.email, req.query.key, function(err, user) {
            if (user) {
                render_data.user = user._id.toString();
                return res.render('users/resetpassword', render_data);
            }
            else {
                render_data.message = 'Something wrong with your reset link, please try again.';
                return res.render('users/resetpassword', render_data);
            }
        });
    }
    else {
        render_data.message = 'Something wrong with your reset link, please try again.';
        return res.render('users/resetpassword', render_data);
    }
}

exports.resetPasswordSend = function(req, res) {
    var render_data = {
        title: 'Reset your password',
        req: req
    };
    if (req.body.new_password && req.body.confirm_password) {
        if (req.body.new_password === req.body.confirm_password) {
            UserModel.load(req.body.user, function(err, user) {
                user.password = req.body.new_password;
                user.save(function(err) {
                    req.logIn(user, function(err) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }
                        return res.redirect('/');
                    });
                });
            });
        }
        else {
            render_data.error = 'Passwords filled not the same.';
            return res.render('users/resetpassword', render_data);
        }
    }
    else {
        render_data.error = 'Plase fill all fields.';
        return res.render('users/resetpassword', render_data);
    }
}



/*
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    UserModel
        .findOne({ _id: req.params.userId })
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


exports.ownerList = function(req, res) {
    return res.render('users/owner_list', {
        title: 'My tickets',
        req: req
    });
}


// private function for handling the association between user and ticket
function handleAssociation(req, user_id) {
    if (typeof(req.session.ticket) !== 'undefined') {
        var ticket_tmp = req.session.ticket;
        // Reload the object, not work with the document
        // This is shit
        if (utils.getTicketType(ticket_tmp) == 'need') {
            NeedModel.load(ticket_tmp._id, function(err, ticket) {
                ticket.user = user_id;
                ticket.save();
            });
        }
        else if (utils.getTicketType(ticket_tmp) == 'offer') {
            OfferModel.load(ticket_tmp._id, function(err, ticket) {
                ticket.user = user_id;
                ticket.save();
            });
        }
        delete req.session.ticket;
    }
}


/*
 * TODO: RESTful GET users listing.
 */
exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.getUserProfileJson = function(req, res) {
    res.json(req.profile);
}