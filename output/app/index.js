/**
 * Created by parallels on 9/5/15.
 */
"use strict";

var extend = require('extend');

module.exports = function (_options) {
    var options = {
        //"postgres": {
        //    "connectionString": "postgres://postgres:password@postgres/",
        //    "postgres": "postgres",
        //    "methodFitness": "MethodFitness"
        //},
        logger: {
            moduleName: 'ReadStoreRepository'
        }
    };
    extend(options, _options || {});

    var container = require('./registry')(options);
    return container.getInstanceOf('repository');
};