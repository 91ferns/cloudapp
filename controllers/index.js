'use strict';


var IndexModel = require('../models/index'),
    conf = require('nconf');


module.exports = function (router) {

    var snippet = process.env.snippet || false;

    console.log(snippet);

    router.get('/', function (req, res) {

        res.render('index', {
          browsersync: snippet
        });

    });

};
