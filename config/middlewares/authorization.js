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
 * Clean session returnTo url middleware
 */
exports.clearReturnTo = function (req, res, next) {
    req.session.returnTo = null;
    next();
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
    },
    isAdmin: function(req, res, next) {
        if (req.user.email !== 'admin@nomp.fr') {
            req.flash('warning', 'You are not authorized');
            req.logout();
            return res.redirect('/admin/');
        }
        next();
    }
}


/*
 * Ticket modification authorization routing middleware
 */
exports.ticket = {
    hasAuthorization: function(req, res, next) {
        if (typeof(req.ticket.user) !== 'undefined') {
            if (req.ticket.user.toString() !== req.user._id.toString()) {
                req.flash('info', 'You are not authorized');
                return res.redirect('/' + req.params.type + '/' + req.ticket.id)
            }
            next();
        }
        else {
            req.flash('info', 'Please enter the reference');
            return res.redirect('/login');
        }
    }
}