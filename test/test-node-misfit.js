'use strict';

var assert = require('assert');
var misfit = require('../');

var InvalidDateError = misfit.InvalidDateError;
var InvalidDateRangeError = misfit.InvalidDateRangeError;
var RequiredParameterError = misfit.RequiredParameterError;

describe('node-misfit functionality tests', function () {
    var misfitMock;
    var misfitHandler;
    var invalidHandlers = [];

    before(function (done) {
        misfitMock = new (require('./mock-api.misfitwearables.com'))({
            port: 8000
        }, function() {
            misfitHandler = new misfit({
                clientId: misfitMock.client.id,
                clientSecret: misfitMock.client.secret
            }, misfitMock.url);

            invalidHandlers = [
                new misfit({
                    clientId: 'invalid',
                    clientSecret: misfitMock.client.secret
                }, misfitMock.url),
                new misfit({
                    clientId: misfitMock.client.id,
                    clientSecret: 'invalid'
                }, misfitMock.url),
            ]
            done();
        });
    });

    after(function (done) {
        misfitMock.shutdown(done);
    });

    describe('authorization and authentication tests', function () {
        it('invalid auth code', function (done) {
            invalidHandlers.forEach(function (invalidHandler) {
                invalidHandler.getAccessToken(misfitMock.client.id, function (err, token) {
                    assert.equal(err.status, 401);
                })
            });
            done();
        });
    });

    describe('#getAccessToken', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getAccessToken();
            }, RequiredParameterError);
        });

        it('invalid auth code', function (done) {
            misfitHandler.getAccessToken('invalid', function (err, token) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'invalid_grant');
                assert.equal(err.message, 'App Id or redirect_uri does not match authorization code');
                done();
            })
        });

        it('expired auth code', function (done) {
            misfitHandler.getAccessToken(misfitMock.expired.code, function (err, token) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'invalid_grant');
                assert.equal(err.message, 'Authorization code expired');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getAccessToken(misfitMock.auth.code, function (err, token) {
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


        it('invalid access token', function (done) {
            misfitHandler.getProfile('invalid', function (err, profile) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getProfile(misfitMock.auth.token, {userId: 'invalid'}, function (err, profile) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getProfile(misfitMock.auth.token, function (err, profile) {
                if(err) { return done(err); }

                    assert.deepEqual({
                        "userId": "51a4189acf12e53f79000001",
                        "name": "Misfit",
                        "birthday": "1955-07-06",
                        "gender": "female",
                        "email": "help@misfit.com"
                    }, profile);

                done();
            });
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
