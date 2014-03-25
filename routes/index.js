
/*
 * GET home page.
 */
var model = require('../models/TicketModel');
var model = require('../models/NeedModel');
var model = require('../models/OfferModel');

exports.index = function(req, res) {

    // var testticket = new model.TicketModel({name: 'test ticket', description: 'test body'});
    // console.log(testticket.description);
    // testticket.creatAndSave({what: 'ever'});
    // res.render('index', { title: testticket.name });
    res.render('index', { title: 'welcome!' });
};

    // BaseModel.find( {}, function(err, model) {
        // if (!err) {
            // console.log(model);
            // res.render('index', { title: model.name });
        // }
        // else { throw err; }
    // });
