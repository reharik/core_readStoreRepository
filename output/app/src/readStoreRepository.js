/**
 * Created by parallels on 7/22/15.
 */
"use strict";

module.exports = function (pgbluebird, uuid, logger) {

    return function (options) {
        var getById = function getById(id, table) {
            var pgb, cnn, result, row;
            return regeneratorRuntime.async(function getById$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        pgb = new pgbluebird();
                        context$3$0.prev = 1;
                        cnn = pgb.connect(options.connectionString + options.database);
                        context$3$0.next = 5;
                        return regeneratorRuntime.awrap(cnn.client.query('SELECT * from "' + table + '" where "Id" = \'' + id + '\''));

                    case 5:
                        result = context$3$0.sent;
                        row = result.rows;

                        cnn.done();
                        return context$3$0.abrupt('return', row.document);

                    case 11:
                        context$3$0.prev = 11;
                        context$3$0.t0 = context$3$0['catch'](1);

                        logger.error('error received during query for table: ' + table + ' Id: ' + id + " : " + context$3$0.t0.message);
                        logger.error(context$3$0.t0);

                    case 15:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, this, [[1, 11]]);
        };

        var save = function save(table, document, id) {
            var pgb, result, cnn, statement;
            return regeneratorRuntime.async(function save$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        pgb = new pgbluebird();
                        context$3$0.prev = 1;
                        context$3$0.next = 4;
                        return regeneratorRuntime.awrap(pgb.connect(options.connectionString + options.database));

                    case 4:
                        cnn = context$3$0.sent;

                        if (!id) {
                            context$3$0.next = 11;
                            break;
                        }

                        context$3$0.next = 8;
                        return regeneratorRuntime.awrap(cnn.client.query('UPDATE "' + table + '" SET document = \'' + document + '\' where Id = \'' + id + '\''));

                    case 8:
                        result = context$3$0.sent;
                        context$3$0.next = 16;
                        break;

                    case 11:
                        statement = 'INSERT INTO "' + table + '" ("id", "document") VALUES (\'' + uuid.v4() + '\',\'' + JSON.stringify(document) + '\')';

                        logger.info(statement);
                        context$3$0.next = 15;
                        return regeneratorRuntime.awrap(cnn.client.query(statement));

                    case 15:
                        result = context$3$0.sent;

                    case 16:
                        cnn.done();
                        return context$3$0.abrupt('return', 'success');

                    case 20:
                        context$3$0.prev = 20;
                        context$3$0.t0 = context$3$0['catch'](1);

                        logger.error('error received saving to table: ' + table + ". msg: " + context$3$0.t0.message);
                        logger.error(context$3$0.t0);

                    case 24:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, this, [[1, 20]]);
        };

        var query = function query(script) {
            var pgb, result, cnn;
            return regeneratorRuntime.async(function query$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        pgb = new pgbluebird();
                        context$3$0.prev = 1;
                        context$3$0.next = 4;
                        return regeneratorRuntime.awrap(pgb.connect(options.connectionString + options.database));

                    case 4:
                        cnn = context$3$0.sent;
                        context$3$0.next = 7;
                        return regeneratorRuntime.awrap(cnn.client.query(script));

                    case 7:
                        result = context$3$0.sent;

                        cnn.done();
                        return context$3$0.abrupt('return', result);

                    case 12:
                        context$3$0.prev = 12;
                        context$3$0.t0 = context$3$0['catch'](1);

                        logger.error('error received running query: ' + script + ". msg: " + context$3$0.t0.message);
                        logger.error(context$3$0.t0);

                    case 16:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, this, [[1, 12]]);
        };

        var checkIdempotency = function checkIdempotency(originalPosition, eventHandlerName) {
            var pgb, cnn, result, row, isNewStream, isIdempotent;
            return regeneratorRuntime.async(function checkIdempotency$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        if (!(eventHandlerName.toLowerCase().indexOf('bootstrap') > -1)) {
                            context$3$0.next = 2;
                            break;
                        }

                        return context$3$0.abrupt('return', { isIdempotent: true, isNewStream: true });

                    case 2:
                        pgb = new pgbluebird();
                        context$3$0.prev = 3;
                        context$3$0.next = 6;
                        return regeneratorRuntime.awrap(pgb.connect(options.connectionString + options.database));

                    case 6:
                        cnn = context$3$0.sent;

                        logger.info('getting last processed postion for eventHandler ' + eventHandlerName);

                        context$3$0.next = 10;
                        return regeneratorRuntime.awrap(cnn.client.query('SELECT * from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\''));

                    case 10:
                        result = context$3$0.sent;
                        row = result.rows;

                        logger.trace('last process position for eventHandler ' + eventHandlerName + ': ' + row.commitPosition);
                        cnn.done();

                        isNewStream = !row || row.length <= 0;
                        isIdempotent = isNewStream || row.CommitPosition < originalPosition.CommitPosition;

                        logger.info('eventHandler ' + eventHandlerName + ' event idempotence is: ' + isIdempotent);
                        return context$3$0.abrupt('return', {
                            isIdempotent: isIdempotent,
                            isNewStream: isNewStream
                        });

                    case 20:
                        context$3$0.prev = 20;
                        context$3$0.t0 = context$3$0['catch'](3);

                        logger.error('error received during last process position call for eventHandler ' + eventHandlerName + ': ' + context$3$0.t0.message);
                        logger.error(context$3$0.t0);

                    case 24:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, this, [[3, 20]]);
        };

        var recordEventProcessed = function recordEventProcessed(originalPosition, eventHandlerName, isNewSteam) {
            var pgb, result, cnn;
            return regeneratorRuntime.async(function recordEventProcessed$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        pgb = new pgbluebird();

                        if (!(!isNewSteam && !originalPosition.HasValue)) {
                            context$3$0.next = 3;
                            break;
                        }

                        throw new Error("ResolvedEvent didn't come off a subscription at all (has no position).");

                    case 3:
                        context$3$0.prev = 3;
                        context$3$0.next = 6;
                        return regeneratorRuntime.awrap(pgb.connect(options.connectionString + options.database));

                    case 6:
                        cnn = context$3$0.sent;

                        logger.trace('setting last process position for eventHandler ' + eventHandlerName + ': ' + originalPosition.commitPosition);

                        if (!isNewSteam) {
                            context$3$0.next = 15;
                            break;
                        }

                        logger.info("creating first position for handler: " + eventHandlerName);
                        context$3$0.next = 12;
                        return regeneratorRuntime.awrap(cnn.client.query('INSERT INTO "lastProcessedPosition" ' + ' ("id", "commitPosition", "preparePosition", "handlerType")' + ' VALUES (\'' + uuid.v4() + '\', ' + originalPosition.CommitPosition + ', ' + originalPosition.PreparePosition + ', \'' + eventHandlerName + '\') '));

                    case 12:
                        result = context$3$0.sent;
                        context$3$0.next = 19;
                        break;

                    case 15:
                        logger.info("updating position for handler: " + eventHandlerName);
                        context$3$0.next = 18;
                        return regeneratorRuntime.awrap(cnn.client.query('UPDATE "lastProcessedPosition"' + 'SET "commitPosition" = ' + originalPosition.CommitPosition + ', "preparePosition" = ' + originalPosition.PreparePosition + ', "handlerType" = \'' + eventHandlerName + '\' WHERE Id = \'' + row.Id + '\''));

                    case 18:
                        result = context$3$0.sent;

                    case 19:
                        cnn.done();
                        return context$3$0.abrupt('return', result);

                    case 23:
                        context$3$0.prev = 23;
                        context$3$0.t0 = context$3$0['catch'](3);

                        logger.error('error received during record event processed call for eventHandler ' + eventHandlerName + ': ' + context$3$0.t0.message);
                        logger.error(context$3$0.t0);

                    case 27:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, this, [[3, 23]]);
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