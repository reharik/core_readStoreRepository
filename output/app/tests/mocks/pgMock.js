/**
 * Created by rharik on 11/23/15.
 */

'use strict';

module.exports = function () {
    return function () {
        var connStatusResult = 'success';
        var queryStatusResult = 'success';
        var result = { hello: 'dolly' };

        var returnResult = function returnResult(_result) {
            result = _result;
        };

        var connStatus = function connStatus(_connStatus) {
            connStatusResult = _connStatus;
        };
        var queryStatus = function queryStatus(_queryStatus) {
            queryStatusResult = _queryStatus;
        };

        var connect = function connect(connectCb) {
            return connectCb(connStatusResult == 'conError' ? "conError" : null);
        };
        var query = function query(_query, queryCb) {
            return queryCb(queryStatusResult == 'queryError' ? 'queryError' : null, result);
        };
        var end = function end() {
            return "called end";
        };
        return {
            returnResult: returnResult,
            connect: connect,
            query: query,
            end: end,
            connStatus: connStatus,
            queryStatus: queryStatus
        };
    };
};