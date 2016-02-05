/**
 * Created by parallels on 9/5/15.
 */
"use strict";

var extend = require('extend');

module.exports = function(_options) {
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
    return require('./registry')(options);
};


