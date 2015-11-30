"use strict";

///**
// * Created by parallels on 7/22/15.
// */
//"use strict";
//
//module.exports = function(pgbluebird, uuid, logger) {
//
//    return function(options) {
//        var getById = async function(id, table) {
//            var pgb = new pgbluebird();
//            try {
//                var cnn    = pgb.connect(options.connectionString + options.database);
//                var result = await cnn.client.query('SELECT * from "' + table + '" where "Id" = \'' + id + '\'');
//                var row    = result.rows;
//                cnn.done();
//                return row.document;
//            } catch (error) {
//                logger.error('error received during query for table: ' + table + ' Id: ' + id + " : " + error.message);
//                logger.error(error);
//            }
//        };
//
//        var save = async function(table, document, id) {
//            var pgb = new pgbluebird();
//            var result;
//            try {
//                var cnn = await pgb.connect(options.connectionString + options.database);
//                if (id) {
//                    result = await cnn.client.query('UPDATE "' + table + '" SET document = \'' + document + '\' where Id = \'' + id + '\'');
//                } else {
//                    var statement = 'INSERT INTO "' + table + '" ("id", "document") VALUES (\'' + uuid.v4() + '\',\'' + JSON.stringify(document) + '\')';
//                    logger.info(statement);
//                    result        = await cnn.client.query(statement);
//                }
//                cnn.done();
//                return 'success';
//            } catch (error) {
//                logger.error('error received saving to table: ' + table + ". msg: " + error.message);
//                logger.error(error);
//            }
//        };
//
//        var query = async function(script) {
//            var pgb = new pgbluebird();
//            var result;
//            try {
//                var cnn = await pgb.connect(options.connectionString + options.database);
//                result  = await cnn.client.query(script);
//                cnn.done();
//                return result;
//            } catch (error) {
//                logger.error('error received running query: ' + script + ". msg: " + error.message);
//                logger.error(error);
//            }
//        };
//
//        var checkIdempotency = async function(originalPosition, eventHandlerName) {
//            if(eventHandlerName.toLowerCase().indexOf('bootstrap')>-1){
//                return{isIdempotent:true, isNewStream:true};
//            }
//            var pgb = new pgbluebird();
//            try {
//                var cnn = await pgb.connect(options.connectionString + options.database);
//                logger.info('getting last processed postion for eventHandler ' + eventHandlerName);
//
//                var result = await cnn.client.query('SELECT * from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\'');
//                var row    = result.rows;
//                logger.trace('last process position for eventHandler ' + eventHandlerName + ': ' + row.commitPosition);
//                cnn.done();
//
//                var isNewStream  = !row || row.length <= 0;
//                var isIdempotent = isNewStream || row.CommitPosition < originalPosition.CommitPosition;
//                logger.info('eventHandler ' + eventHandlerName + ' event idempotence is: ' + isIdempotent);
//                return {
//                    isIdempotent: isIdempotent,
//                    isNewStream : isNewStream
//                };
//            } catch (error) {
//                logger.error('error received during last process position call for eventHandler ' + eventHandlerName + ': ' + error.message);
//                logger.error(error);
//            }
//        };
//
//        var recordEventProcessed = async function(originalPosition, eventHandlerName, isNewSteam) {
//            var pgb = new pgbluebird();
//            var result;
//            if (!isNewSteam && !originalPosition.HasValue) {
//                throw new Error("ResolvedEvent didn't come off a subscription at all (has no position).");
//            }
//            try {
//                var cnn = await pgb.connect(options.connectionString + options.database);
//                logger.trace('setting last process position for eventHandler ' + eventHandlerName + ': ' + originalPosition.commitPosition);
//                if (isNewSteam) {
//                    logger.info("creating first position for handler: " + eventHandlerName);
//                    result = await cnn.client.query('INSERT INTO "lastProcessedPosition" ' +
//                        ' ("id", "commitPosition", "preparePosition", "handlerType")' +
//                        ' VALUES (\'' + uuid.v4() + '\', ' + originalPosition.CommitPosition + ', ' + originalPosition.PreparePosition + ', \'' + eventHandlerName + '\') ');
//                } else {
//                    logger.info("updating position for handler: " + eventHandlerName);
//                    result = await cnn.client.query('UPDATE "lastProcessedPosition"' +
//                        'SET "commitPosition" = ' + originalPosition.CommitPosition +
//                        ', "preparePosition" = ' + originalPosition.PreparePosition +
//                        ', "handlerType" = \'' + eventHandlerName +
//                        '\' WHERE Id = \'' + row.Id + '\'');
//                }
//                cnn.done();
//                return result;
//            } catch (error) {
//                logger.error('error received during record event processed call for eventHandler ' + eventHandlerName + ': ' + error.message);
//                logger.error(error);
//            }
//        };
//        return {
//            getById             : getById,
//            save                : save,
//            query               : query,
//            checkIdempotency    : checkIdempotency,
//            recordEventProcessed: recordEventProcessed
//        }
//    };
//};