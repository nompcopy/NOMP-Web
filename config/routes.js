/*
 * Expose routes
 */
var path = require('path');
var routes = require('../controllers/index');
var tickets = require('../controllers/tickets');
var mongoose = require('mongoose');
module.exports = function (app) {
    app.get('/', routes.index);

/*
 * Ticket routes
 * Use Regex in order to deal with need and offer at same time
 */
    // app.get('/ticket', tickets.index);
    app.get('/:type(need|offer|ticket)', tickets.index);
    app.get('/:type(need|offer)/list', tickets.list);
    app.get('/:type(need|offer|ticket)/new', tickets.new);
    app.get('/:type(need|offer|ticket)/:id', tickets.show);
    app.get('/:type(need|offer|ticket)/:id/edit', tickets.edit);

};