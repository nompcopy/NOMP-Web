/*
 * Expose routes
 */

var routes = require('../routes/index')

module.exports = function (app) {
    app.get('/', routes.index);
};