/**
 * Created by rharik on 11/24/15.
 */

module.exports = function pgClient(pg){
    return function(_options) {
        var options = _options && _options.postgres ? _options.postgres : {};
        return new pg.Client(options.connectionString + options.database);
    }
};