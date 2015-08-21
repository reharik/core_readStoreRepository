/**
 * Created by reharik on 8/15/15.
 */

var Promise = require('bluebird');
var mock = function() {
    return {
        getById: getById,
        save: save,
        query: query,
        checkIdempotency: checkIdempotency,
        recordEventProcessed: recordEventProcessed
    }
};

mock.prototype.getById =function(id, table) {
    return Promise.resolve('success');
};

mock.prototype.save =function(table, document, id) {
    return Promise.resolve('success');
};

mock.prototype.query=function(script) {
    return Promise.resolve('success');
};

mock.prototype.checkIdempotency=function(originalPosition, eventHandlerName) {
    return Promise.resolve('success');
};

mock.prototype.recordEventProcessed=function(originalPosition, eventHandlerName, isNewSteam) {
    return Promise.resolve('success');
};


module.exports = mock;