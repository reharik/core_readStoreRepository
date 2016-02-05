/**
 * Created by rharik on 11/23/15.
 */
var demand = require('must');

describe('gesEventHandlerBase', function() {
    var mut;
    var _mut;
    var eventmodels;
    var uuid ;
    var JSON;
    var _fantasy;
    var Future;
    var treis;
    var R;
    var options;
    var pgClient;
    var container = require('../../registry_test')(options);

    beforeEach(function(){
        eventmodels = container.getInstanceOf('eventmodels');
        _fantasy = container.getInstanceOf('_fantasy');
        R = container.getInstanceOf('R');
        treis = container.getInstanceOf('treis');
        Future = _fantasy.Future;
        pgClient = container.getInstanceOf('pgClient');
        pgClient.connStatus('success');
        pgClient.queryStatus('success');

        uuid = require('uuid');
        JSON = require('JSON');
        options = {
            connectionString:'connectionString',
            database:'database'
        };
        _mut = container.getInstanceOf('repository');

        mut = _mut(options);
    });

    describe('#GETBYID', function() {
        context('when with valid id and table', function () {
            it('should return the data',  function () {
                pgClient.returnResult({rows:{document:{some:'data'}}});
                mut.getById(uuid.v4(), 'someTable')
                    .fork(x=> x.must.be.true(),
                        x=>x.some.must.be.equal('data'))
            })
        });

        context('when throwing error on connection', function () {
            it('should return the error',  function () {
                pgClient.connStatus('conError');
                mut.getById(uuid.v4(), 'someTable')
                    .fork(x=> x.must.equal('conError'),
                        x=>x.must.be.true())
            })
        });

        context('when throwing error on query', function () {
            it('should return the error',  function () {
                pgClient.queryStatus('queryError');
                mut.getById(uuid.v4(), 'someTable')
                    .fork(x=> x.must.equal('queryError'),
                        x=>x.must.be.true())
            })
        });
    });

    describe('#SAVE', function() {
        context('when without id', function () {
            it('should return the success',  function () {
                pgClient.returnResult('success');
                mut.save('table', {doc:'ument'})
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.equal('success'))
            })
        });

        context('when with id', function () {
            it('should return the success',  function () {
                pgClient.returnResult('success');
                mut.save('table', {doc:'ument'}, uuid.v4())
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.equal('success'))
            })
        });
    });

    describe('#QUERY', function() {
        context('when calling with successful query', function () {
            it('should return success',  function () {
                pgClient.returnResult('success');
                mut.query('some query')
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.equal('success'))
            })
        });
    });

    describe('#CHECKIDEMPOTENCY', function() {
        context('when calling with successful query', function () {
            it('should return success',  function () {
                pgClient.returnResult({CommitPosition:1});
                mut.checkIdempotency({CommitPosition:100})
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.true())
            })
        });
        context('when calling with missing input', function () {
            it('should not blow up',  function () {
                pgClient.returnResult({CommitPosition:1});
                mut.checkIdempotency({})
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.empty())
            })
        });

        context('when calling with no result', function () {
            it('should not blow up',  function () {
                pgClient.returnResult({});
                mut.checkIdempotency({CommitPosition:100})
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.empty())
            })
        });
    });

    describe('#RECORDEVENTPROCESSED', function() {
        context('when calling with successful query', function () {
            it('should return success',  function () {
                pgClient.returnResult('success');
                var originalPosition= {
                        CommitPosition : 1,
                        PreparePosition: 2
                    };
                mut.recordEventProcessed(originalPosition, 'handlerName')
                    .fork(x=> x.must.be.true(),
                        x=>x.must.be.equal('success'));
            })
        });

    });

});
