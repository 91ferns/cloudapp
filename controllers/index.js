'use strict';


var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {
        res.render('index', {
          browsersync: process.env.snippet || false,
          services: model.services,
          applications: model.applications,
          test: 'hey'
        });

    });

};
