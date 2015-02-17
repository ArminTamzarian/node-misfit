'use strict';

var assert = require('assert');
var misfit = require('../');

var InvalidDateError = misfit.InvalidDateError;
var InvalidDateRangeError = misfit.InvalidDateRangeError;
var InvalidParameterError = misfit.InvalidParameterError;
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
    describe('#getAuthorizeUrl', function () {
        it('invalid type', function () {
            assert.throws( function() {
                misfitHandler.getAuthorizeUrl('foobar');
            }, InvalidParameterError);
        });

        it('valid parameters', function () {
            assert.doesNotThrow( function() {
                misfitHandler.getAuthorizeUrl();
            }, InvalidParameterError);

            assert.doesNotThrow( function() {
                misfitHandler.getAuthorizeUrl('code');
            }, InvalidParameterError);

            assert.doesNotThrow( function() {
                misfitHandler.getAuthorizeUrl('token');
            }, InvalidParameterError);
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
                        'userId': '51a4189acf12e53f79000001',
                        'name': 'Misfit',
                        'birthday': '1955-07-06',
                        'gender': 'female',
                        'email': 'help@misfit.com'
                    }, profile);

                done();
            });
        });
    });

    describe('#getDevice', function () {
        it('missing parameters', function () {
            assert.throws( function() {
                misfitHandler.getDevice();
            }, RequiredParameterError);
        });

        it('invalid access token', function (done) {
            misfitHandler.getDevice('invalid', function (err, device) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getDevice(misfitMock.auth.token, {userId: 'invalid'}, function (err, device) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getDevice(misfitMock.auth.token, function (err, device) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'id': '51a4189acf12e53f80000001',
                    'deviceType': 'shine',
                    'serialNumber':' XXXXXV0011',
                    'firmwareVersion': '0.0.50r',
                    'batteryLevel': 40
                }, device);

                done();
            });
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

        it('invalid access token', function (done) {
            misfitHandler.getGoals('invalid', '2013-10-01', '2013-10-30', function (err, goals) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getGoals(misfitMock.auth.token, '2013-10-01', '2013-10-30', {userId: 'invalid'}, function (err, goals) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getGoals(misfitMock.auth.token, '2013-10-01', '2013-10-30', function (err, goals) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'goals': [
                    {
                        'id': '51a4189acf12e53f81000001',
                        'date': '2013-10-05',
                        'points': 500,
                        'targetPoints': 1000
                    },
                    {
                        'id': '51a4189acf12e53f81000002',
                        'date': '2013-10-06',
                        'points': 506,
                        'targetPoints': 1000
                    }
                    ]
                }, goals);

                done();
            });
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

        it('invalid access token', function (done) {
            misfitHandler.getSummary('invalid', '2013-10-01', '2013-10-30', function (err, summary) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getSummary(misfitMock.auth.token, '2013-10-01', '2013-10-30', {userId: 'invalid'}, function (err, summary) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getSummary(misfitMock.auth.token, '2013-10-01', '2013-10-30', function (err, summary) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'points': 96.4,
                    'steps': 888,
                    'calories': 3132.3888,
                    'activityCalories': 547.1241,
                    'distance': 0.2821
                }, summary);

                done();
            });
        });

        it('valid parameters with detail', function (done) {
            misfitHandler.getSummary(misfitMock.auth.token, '2013-10-01', '2013-10-30', {detail: true}, function (err, summary) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'summary': [
                        {
                            'date': '2013-11-05',
                            'points': 394.4,
                            'steps': 3650,
                            'calories': 1687.4735,
                            'activityCalories': 412.3124,
                            'distance': 1.18
                        },
                        {
                            'date': '2013-11-06',
                            'points': 459.6,
                            'steps': 4330,
                            'calories': 1707.8484,
                            'activityCalories': 412.3124,
                            'distance': 1.3982
                        },
                        {
                            'date': '2013-11-07',
                            'points': 430.4,
                            'steps': 4022,
                            'calories': 1698.7234,
                            'activityCalories': 412.3124,
                            'distance': 1.2988
                        },
                        {
                            'date': '2013-11-08',
                            'points': 376,
                            'steps': 3514,
                            'calories': 1681.7235,
                            'activityCalories': 412.3124,
                            'distance': 1.1429
                        }
                    ]
                }, summary);

                done();
            });
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

        it('invalid access token', function (done) {
            misfitHandler.getSessions('invalid', '2013-10-01', '2013-10-30', function (err, sessions) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getSessions(misfitMock.auth.token, '2013-10-01', '2013-10-30', {userId: 'invalid'}, function (err, sessions) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getSessions(misfitMock.auth.token, '2013-10-01', '2013-10-30', function (err, sessions) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'sessions':[
                    {
                        'id':'51a4189acf12e53f82000001',
                        'activityType':'Cycling',
                        'startTime':'2013-11-05T10:26:54-04:00',
                        'duration':900,
                        'points':210.8,
                        'steps':1406,
                        'calories':25.7325,
                        'distance':0.5125
                    },
                    {
                        'id':'51a4189acf12e53f82000002',
                        'activityType':'Cycling',
                        'startTime':'2013-11-06T10:26:54-04:00',
                        'duration':901,
                        'points':210.9,
                        'steps':1407,
                        'calories':25.7326,
                        'distance':0.5126
                    },
                    ]
                }, sessions);

                done();
            });
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


        it('invalid access token', function (done) {
            misfitHandler.getSleeps('invalid', '2013-10-01', '2013-10-30', function (err, sleeps) {
                assert.equal(err.status, 401);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Invalid Access Token');
                done();
            })
        });

        it('invalid user id token', function (done) {
            misfitHandler.getSleeps(misfitMock.auth.token, '2013-10-01', '2013-10-30', {userId: 'invalid'}, function (err, sleeps) {
                assert.equal(err.status, 403);
                assert.equal(err.type, 'api');
                assert.equal(err.message, 'Forbidden');
                done();
            })
        });

        it('valid parameters', function (done) {
            misfitHandler.getSleeps(misfitMock.auth.token, '2015-01-18', '2015-01-18', function (err, sleeps) {
                if(err) { return done(err); }

                assert.deepEqual({
                    'sleeps': [
                    {
                        'id': '54bbb383c00ae7002434af92',
                        'autoDetected': true,
                        'startTime': '2015-01-18T00:04:49-06:00',
                        'duration': 25260,
                        'sleepDetails': [
                        {
                            'datetime': '2015-01-18T00:04:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T00:11:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T00:43:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T01:36:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T02:33:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T03:15:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T03:22:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T03:47:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T04:05:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T04:12:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T04:54:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T06:02:49-06:00',
                            'value': 1
                        },
                        {
                            'datetime': '2015-01-18T06:09:49-06:00',
                            'value': 2
                        },
                        {
                            'datetime': '2015-01-18T06:31:49-06:00',
                            'value': 3
                        },
                        {
                            'datetime': '2015-01-18T06:42:49-06:00',
                            'value': 2
                        }
                        ]
                    }
                    ]
                }, sleeps);

                done();
            });
        });
    });
});
