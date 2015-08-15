/**
 * Created by reharik on 8/13/15.
 */

var extend = require('extend');
var yowlWrapper = require('yowlWrapper');
var readStoreRepository = require('readStoreRepository');

module.exports = function index(_options) {
    var options = {
        "postgres": {
            "connectionString": "postgres://postgres:password@postgres/",
            "postgres": "postgres",
            "methodFitness": "MethodFitness"
        },
        logger: {
            moduleName: 'ReadStoreRepository'
        }
    };
    extend(options, _options || {});

    var logger = yowlWrapper(options.logger);
    return readStoreRepository(logger, options.readStoreRepository);
};