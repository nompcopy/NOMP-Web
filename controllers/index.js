
/*
 * GET home page.
 */
var model = require('../models/TicketModel');
var model = require('../models/NeedModel');
var model = require('../models/OfferModel');
var model = require('../models/MatchingModel');
var model = require('../models/ActorTypeModel');
var model = require('../models/ClassificationModel');
var model = require('../lib/ParseExcel');

exports.index = function(req, res) {
    res.render('index', { title: 'Welcome !' });
};
