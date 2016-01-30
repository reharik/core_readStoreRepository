/**
 * Created by rharik on 11/23/15.
 */


module.exports = function(pg, R, _fantasy, eventmodels, uuid, logger) {

    return function(_options) {
        var options = _options && _options.postgres ? _options.postgres : {};
        var fh = eventmodels.functionalHelpers;
        var Future = _fantasy.Future;

        var pgFuture = function(query, handleResult) {
            return Future((rej, ret) => {
                var pgClient = new pg.Client(options.connectionString + options.database);
                pgClient.connect(cErr => {
                    if(cErr) {
                        return rej(cErr);
                    }
                        pgClient.query(query, (err, result) => {
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

        var getById = function(id, table){
            var query = ('SELECT * from "' + table + '" where "Id" = \'' + id + '\'');
            var handlerResult = R.compose(R.chain(fh.safeProp('document')),fh.safeProp('rows'));
            return pgFuture(query, handlerResult);
        };

        var save = function(table, document, id){
            var query;
            if (id) {
                query = 'UPDATE "' + table + '" SET document = \'' + JSON.stringify(document) + '\' where Id = \'' + id + '\'';
            } else {
                query = 'INSERT INTO "' + table + '" ("id", "document") VALUES (\'' + uuid.v4() + '\',\'' + JSON.stringify(document) + '\')';
            }
            var handlerResult = r=>_fantasy.Maybe.of(r);
            return pgFuture(query, handlerResult);
        };

       var query = function(query){
           var handlerResult = r=>_fantasy.Maybe.of(r);
           return pgFuture(query, handlerResult);
       };

        var checkIdempotency = function(originalPosition, eventHandlerName) {
            var query          = 'SELECT * from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\'';
            var mGreater       = R.lift(R.gt);
            var curriedGreater = mGreater(fh.safeProp('CommitPosition', originalPosition));

            var handleRowIfPresent = R.compose(curriedGreater, R.map(fh.safeProp('CommitPosition'), fh.safeProp('rows')));

            var handlerResult = x => mGreater(fh.safeProp('rowCount', x), R.for(0))
                    ? handleRowIfPresent(x)
                    : true;

            return pgFuture(query, handlerResult);
        };

        var recordEventProcessed = function(originalPosition, eventHandlerName) {
            var query = `IF EXISTS ( SELECT 1 from "lastProcessedPosition" where "handlerType" = '${eventHandlerName}')
 THEN
 UPDATE "lastProcessedPosition"
 SET "commitPosition" = '${originalPosition.CommitPosition}'
, "preparePosition" = '${originalPosition.PreparePosition}'
, "handlerType" =  '${eventHandlerName}'
 WHERE "handlerType" = '${eventHandlerName}'
 ELSE
 INSERT INTO "lastProcessedPosition"
 ("id", "commitPosition", "preparePosition", "handlerType")
 VALUES ( '${uuid.v4() }' , '${originalPosition.CommitPosition}'
, '${originalPosition.PreparePosition}', '${eventHandlerName }' )
END IF`;
            var handlerResult = r=>_fantasy.Maybe.of(r);
            return pgFuture(query, handlerResult);
        };

        return {
            getById,
            save,
            query,
            checkIdempotency,
            recordEventProcessed
        }
    }
};