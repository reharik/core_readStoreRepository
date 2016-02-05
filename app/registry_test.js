/**
 * Created by parallels on 9/3/15.
 */
"use strict";

var dagon = require('dagon');
var path = require('path');

module.exports = function(_options) {
    var options = _options || {};
    var container = dagon(options.dagon);
    return new container(x=>
        x.pathToRoot(path.join(__dirname,'..'))
            .requireDirectoryRecursively('./app/src')
            .for('bluebird').renameTo('Promise')
            .for('pgClient').require('./app/tests/mocks/pgMock.js').instantiate(i=>i.asFunc())
            .for('corelogger').renameTo('logger').instantiate(i=>i.asFunc().withParameters(options.logger || {}))
            .for('eventmodels').instantiate(i=>i.asFunc())
            //.for('repository').instantiate(i=>i.asFunc().withParameters(options.postgres || {}))
            .for('ramda').renameTo('R')
            .for('ramdafantasy').renameTo('_fantasy')
            .complete());
};
