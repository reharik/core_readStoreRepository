/**
 * Created by rharik on 11/24/15.
 */

"use strict";

module.exports = function pgClient(pg) {
    return function (options) {
        return new pg.client(options.connectionString + options.database);
    };
};