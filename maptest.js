
var async = require('async');


var computeDistance = function(cb) {

    async.waterfall = ([
        function(callback) {
            console.log('===============================');
            gm.geocode('Troyes, France', function(err, result) {
                console.log(result.results);
                callback(null, '==========');
            });
        },
        function(location1, callback) {
            gm.geocode('Paris, France', function(err, result) {
                console.log(result.results);
                callback(null, location1, result.results);
            });
        },
        function(location1, location2, callback) {
            console.log(location1);
            console.log(location2);
            callback(null, '===');
        }
    ], cb);
}

computeDistance(function(err, result) {
    console.log('=============');
});
