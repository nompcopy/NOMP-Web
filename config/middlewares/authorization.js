/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.method == 'GET') {
        req.session.returnTo = req.originalUrl;
    }
    res.redirect('/login');
}

/*
 *  User authorization routing middleware
 */

exports.user = {
    hasAuthorization: function (req, res, next) {
      if (req.profile.id != req.user.id) {
          req.flash('info', 'You are not authorized');
          return res.redirect('/user/' + req.profile.id);
      }
      next();
    }
}

/*
 * Ticket modification authorization routing middleware
 */
exports.ticket = {
    hasAuthorization: function(req, res, next) {
        console.log(req.ticket);
        console.log(req.user);
        if (req.ticket.user != req.user.id) {
            req.flash('info', 'You are not authorized')
            return res.redirect('/' + req.params.type + '/' + req.ticket.id)
        }
        next();
    }
}