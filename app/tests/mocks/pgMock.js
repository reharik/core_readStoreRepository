/**
 * Created by rharik on 11/23/15.
 */

module.exports = function() {
    return function() {
        var connStatusResult = 'success';
        var queryStatusResult = 'success';
        var result       = {hello:'dolly'};

        var returnResult = function(_result) {
            result = _result;
        };

        var connStatus = function(_connStatus) {
            connStatusResult = _connStatus;
        };
        var queryStatus = function(_queryStatus) {
            queryStatusResult = _queryStatus;
        };

        var connect      = function(connectCb) {
            return connectCb(connStatusResult == 'conError' ? "conError" : null);
        };
        var query        = function(query, queryCb) {
            return queryCb(queryStatusResult == 'queryError' ? 'queryError' : null, result);
        };
        var end          = function() {
            return "called end";
        };
        return {
            returnResult,
            connect,
            query,
            end,
            connStatus,
            queryStatus
        }
    }
};