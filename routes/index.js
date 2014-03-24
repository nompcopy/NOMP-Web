
/*
 * GET home page.
 */
var model = require('../models/TicketModel');

exports.index = function(req, res) {

    var testticket = new model.TicketModel({name: 'test ticket', description: 'test body'});
    console.log(testticket.description);
    testticket.creatAndSave({what: 'ever'});
    res.render('index', { title: testticket.name });
};
    // res.render('index', { title: 'Express'});
    // return function(req, res) {
        // var testticket = new BaseModel( {name: 'test ticket', body: 'test body'});
        // res.render('index', { title: 'test' });
        // console.log(testticket.name);
        // res.render('index', { title: testticket.name});
    // };
    // BaseModel.find( {}, function(err, model) {
        // if (!err) {
            // console.log(model);
            // res.render('index', { title: model.name });
        // }
        // else { throw err; }
    // });
