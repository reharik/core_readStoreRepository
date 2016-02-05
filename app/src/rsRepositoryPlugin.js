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


        var getSafeProp = (src,prop) => R.map(fh.safeProp(prop), src);
        var getValue = (src,prop,default) => getSafeProp(src,prop).getOrElse(default);

        var checkIdempotency = function(originalPosition, eventHandlerName) {
            var query          = 'SELECT * from "lastProcessedPosition" where "handlerType" = \'' + eventHandlerName + '\'';
            var mGreater       = R.lift(R.gt);
            var curriedGreater = mGreater(getSafeProp(originalPosition, 'CommitPosition'));
            var takeFirst      = x => x[0];
            var handleRowIfPresent = R.compose(curriedGreater, R.chain(fh.safeProp('commitPosition')), R.map(takeFirst), fh.safeProp('rows'));

            var handlerResult = x => mGreater(fh.safeProp('rowCount', x), R.of(0))[0]
                ? {isIdempotent: handleRowIfPresent(x).getOrElse(false)}
                : {isIdempotent: true};

            return pgFuture(query, handlerResult);
        };


        var recordEventProcessed = function(originalPosition, eventHandlerName) {
            var query = `WITH UPSERT AS (
 UPDATE "lastProcessedPosition"
 SET "commitPosition" = '${getValue(originialPosition,'commitPosition','')}'
, "preparePosition" = '${getValue(originialPosition,'PreparePosition','')}' 
, "handlerType" =  '${eventHandlerName}'
 WHERE "handlerType" = '${eventHandlerName}' )
 INSERT INTO "lastProcessedPosition"
 ("id", "commitPosition", "preparePosition", "handlerType")
 SELECT '${uuid.v4() }' , '${getValue(originialPosition,'commitPosition','')}'
, '${getValue(originialPosition,'PreparePosition','')}', '${eventHandlerName }'
WHERE NOT EXISTS ( SELECT 1 from "lastProcessedPosition" where "handlerType" = '${eventHandlerName}')`;

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
