/**
 * Created by reharik on 8/15/15.
 */

'use strict';

var Promise = require('bluebird');
module.exports = {
    getById: function getById(id, table) {
        return Promise.resolve('success');
    },
    save: function save(table, document, id) {
        return Promise.resolve('success');
    },
    query: function query(script) {
        return Promise.resolve('success');
    },
    checkIdempotency: function checkIdempotency(originalPosition, eventHandlerName) {
        return Promise.resolve({ isIdempotent: true });
    },
    recordEventProcessed: function recordEventProcessed(originalPosition, eventHandlerName, isNewSteam) {
        return Promise.resolve('success');
    }
};