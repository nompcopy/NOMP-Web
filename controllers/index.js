
/*
 * GET home page.
 */
var model = require('../models/TicketModel');
var model = require('../models/NeedModel');
var model = require('../models/OfferModel');

exports.index = function(req, res) {
    res.render('index', { title: 'Welcome !' });
};
