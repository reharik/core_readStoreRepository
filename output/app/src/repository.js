/**
 * Created by rharik on 11/23/15.
 */

'use strict';

module.exports = function (pgClient, R, _fantasy, eventmodels, uuid, logger) {

    return function () {
        var fh = eventmodels.functionalHelpers;
        var Future = _fantasy.Future;

        var pgFuture = function pgFuture(query, handleResult) {
            return Future(function (rej, ret) {
                pgClient.connect(function (cErr) {
                    if (cErr) {
                        return rej(cErr);
                    }
                    pgClient.query(query, function (err, result) {
                        if (err) {
                            rej(err);
                            return pgClient.end();
                        }
                        ret(handleResult(result).getOrElse({}));
                        pgClient.end();
                    });
                });
            });
        };

        var getById = function getById(id, table) {
            var query = 'SELECT * from "' + table + '" where "Id" = \'' + id + '\'';
            var handlerResult = R.compose(R.chain(fh.safeProp('document')), fh.safeProp('rows'));
            return pgFuture(query, handlerResult);
        };

        var save = function save(table, document, id) {
            var query;
            if (id) {
                query = 'UPDATE "' + table + '" SET document = \'' + JSON.stringify(document) + '\' where Id = \'' + id + '\'';
            } else {
                query = 'INSERT INTO "' + table + '" ("id", "document") VALUES (\'' + uuid.v4() + '\',\'' + JSON.stringify(document) + '\')';
            }
            var handlerResult = function handlerResult(r) {
                return _fantasy.Maybe.of(r);
            };
            return pgFuture(query, handlerResult);
        };

        var query = function query(_query) {
            var handlerResult = function handlerResult(r) {
                return _fantasy.Maybe.of(r);
            };
            return pgFuture(_query, handlerResult);
        };

        var checkIdempotency = function checkIdempotency(originalPosition, eventHandlerName) {
            var query = 'SELECT * from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\'';
            var mGreater = R.lift(R.gt);
            var curriedGreater = mGreater(fh.safeProp('CommitPosition', originalPosition));
            var handlerResult = R.compose(curriedGreater, fh.safeProp('CommitPosition'));

            return pgFuture(query, handlerResult);
        };

        var recordEventProcessed = function recordEventProcessed(originalPosition, eventHandlerName) {
            var query = 'IF EXISTS ( SELECT 1 from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\')\n THEN\n UPDATE "lastProcessedPosition"\n SET "commitPosition" = \'' + originalPosition.CommitPosition + '\'\n, "preparePosition" = \'' + originalPosition.PreparePosition + '\'\n, "handlerType" =  \'' + eventHandlerName + '\'\n WHERE "handlerType" = \'' + eventHandlerName + '\'\n ELSE\n INSERT INTO "lastProcessedPosition"\n ("id", "commitPosition", "preparePosition", "handlerType")\n VALUES ( \'' + uuid.v4() + '\' , \'' + originalPosition.CommitPosition + '\'\n, \'' + originalPosition.PreparePosition + '\', \'' + eventHandlerName + '\' )\nEND IF';
            var handlerResult = function handlerResult(r) {
                return _fantasy.Maybe.of(r);
            };
            return pgFuture(query, handlerResult);
        };

        return {
            getById: getById,
            save: save,
            query: query,
            checkIdempotency: checkIdempotency,
            recordEventProcessed: recordEventProcessed
        };
    };
};