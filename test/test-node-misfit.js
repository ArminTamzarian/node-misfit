'use strict';

var assert = require('assert');
var misfit = require('../');

var InvalidDateError = misfit.InvalidDateError;
var InvalidDateRangeError = misfit.InvalidDateRangeError;
var RequiredParameterError = misfit.RequiredParameterError;


describe('node-misfit tests', function () {
    var misfitMock;
    var misfitHandler;

    before(function (done) {
        misfitMock = new (require('./mock-api.misfitwearables.com'))({
            port: 8000
        }, function() {
            misfitHandler = new misfit({
                clientId: misfitMock.client.id,
                clientSecret: misfitMock.client.secret
            }, misfitMock.url);
            done();
        });
    });

    //TODO: Test 401 client identification errors

    describe('#getAccessToken', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getAccessToken();
            }, RequiredParameterError);
        });

        it('invalid auth code', function (done) {
            misfitHandler.getAccessToken('invalid', function(err, token){
                assert.equal(err.status, 403);
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getAccessToken(misfitMock.auth.code, function(err, token){
                if(err) { return done(err); }

                assert.equal(misfitMock.auth.token, token);

                done();
            })
        });
    });

    describe('#getProfile', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getProfile();
            }, RequiredParameterError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getProfile('getProfile');
            }, RequiredParameterError);
        });
    });

    describe('#getDevice', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getProfile();
            }, RequiredParameterError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getProfile('getDevice');
            }, RequiredParameterError);
        });
    });

    describe('#getGoals', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getGoals();
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getGoals('getGoals');
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getGoals('getGoals', '2000-01-01');
            }, RequiredParameterError);
        });

        it('invalid dates', function () {
            assert.throws( function() {
                misfitHandler.getGoals('getGoals', '00-11-2222', '33-44-5555');
            }, InvalidDateError);
            assert.throws( function() {
                misfitHandler.getGoals('getGoals', '3000-01-01', '2000-01-01');
            }, InvalidDateRangeError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getProfile('getGoals', '2000-01-01', '2001-01-30');
            }, RequiredParameterError);
        });
    });


    describe('#getSummary', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getSummary();
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSummary('getSummary');
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSummary('getSummary', '2000-01-01');
            }, RequiredParameterError);
        });

        it('invalid dates', function () {
            assert.throws( function() {
                misfitHandler.getSummary('getSummary', '00-11-2222', '33-44-5555');
            }, InvalidDateError);
            assert.throws( function() {
                misfitHandler.getSummary('getSummary', '3000-01-01', '2000-01-01');
            }, InvalidDateRangeError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getSummary('getSummary', '2000-01-01', '2001-01-30');
            }, RequiredParameterError);
        });
    });

    describe('#getSessions', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getSessions();
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSessions('getSessions');
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSessions('getSessions', '2000-01-01');
            }, RequiredParameterError);
        });

        it('invalid dates', function () {
            assert.throws( function() {
                misfitHandler.getSessions('getSessions', '00-11-2222', '33-44-5555');
            }, InvalidDateError);
            assert.throws( function() {
                misfitHandler.getSessions('getSessions', '3000-01-01', '2000-01-01');
            }, InvalidDateRangeError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getSessions('getSessions', '2000-01-01', '2001-01-30');
            }, RequiredParameterError);
        });
    });

    describe('#getSleeps', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getSleeps();
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSleeps('getSleeps');
            }, RequiredParameterError);
            assert.throws( function() {
                misfitHandler.getSleeps('getSleeps', '2000-01-01');
            }, RequiredParameterError);
        });


        it('invalid dates', function () {
            assert.throws( function() {
                misfitHandler.getSleeps('getSleeps', '00-11-2222', '33-44-5555');
            }, InvalidDateError);
            assert.throws( function() {
                misfitHandler.getSleeps('getSleeps', '3000-01-01', '2000-01-01');
            }, InvalidDateRangeError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getSleeps('getSleeps', '2000-01-01', '2001-01-30');
            }, RequiredParameterError);
        });
    });
});
