
/*
 * GET home page.
 */
var model = require('../models/BaseModel');

exports.index = function(req, res) {

    var testticket = new model.BaseModel({title: 'test ticket', body: 'test body'});
    console.log(testticket.title);
    res.render('index', { title: testticket.title });
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
