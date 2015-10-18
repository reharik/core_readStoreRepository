/**
 * Created by reharik on 8/15/15.
 */

var Promise = require('bluebird');
module.exports = {
    getById: function (id, table) {
        return Promise.resolve('success');
    },
    save: function (table, document, id) {
        return Promise.resolve('success');
    },
    query: function (script) {
        return Promise.resolve('success');
    },
    checkIdempotency: function (originalPosition, eventHandlerName) {
        return Promise.resolve({ isIdempotent: true });
    },
    recordEventProcessed: function (originalPosition, eventHandlerName, isNewSteam) {
        return Promise.resolve('success');
    }
};