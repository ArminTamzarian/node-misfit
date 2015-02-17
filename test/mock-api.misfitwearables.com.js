var restify = require('restify');

var MisfitMock = (function () {
    var VALID_CLIENT = {
        id: 'e1wj83r9dan4qcqn',
        secret: 'ghacfcx1jko4o4iw3nnysn12x1xzn4sa'
    }

    var VALID_AUTH = {
        code: '8f673z9qpn58hm4f',
        token: 'lwwz08i9qj36d1rflsu4a44vsld51qpddr2jpay5zs13zioqgplgjvih61tyi811p9q4aefzw682unih29nbuvz7nivbw22r1i1hm6npilhiepp653op4dmx1nynf64neba77nmff9nz43wzcqfm9rq0lutqr3jb4k81d0myff4aoqz664jl2zbdja9g3zidpw483wd8178g3ysf81qg6rzw7f204a3zddx6zg46d3s67bb5ircfoh1lmtrgak5'
    };

    var EXPIRED_AUTH = {
        code: '8f673z9qpn58hm4g'
    };

    function validateClient(req, res, next) {
        if(req.body.client_id !== VALID_CLIENT.id || req.body.client_secret !== VALID_CLIENT.secret) {
            return res.send(401);
        }

        next();
    }

    function validateAuthorization(req, res, next) {
        if(req.headers.authorization) {
            var bearer = req.headers.authorization.split(' ');

            if(bearer.length !== 2 || bearer[0] !== 'Bearer' || bearer[1] !== VALID_AUTH.token) {
                return res.json(401, {
                    code: 401,
                    message: 'Invalid Access Token'
                });
            }
        }

        next();
    }

    var misfitMock = function (options, callback) {
        var server = restify.createServer();
        server.use(restify.bodyParser());
        server.use(restify.queryParser());

        server.post('/auth/tokens/exchange', validateClient, function (req, res) {

            if (req.body.code === EXPIRED_AUTH.code) {
                return res.json(403, {
                    error: 'invalid_grant',
                    error_description: 'Authorization code expired'
                });
            }

            if (req.body.code !== VALID_AUTH.code) {
                return res.json(403, {
                    error: 'invalid_grant',
                    error_description: 'App Id or redirect_uri does not match authorization code'
                });
            }

            res.json({
                access_token: VALID_AUTH.token,
                token_type: 'bearer'
            });
        });

        server.get('/move/resource/v1/user/:userId/profile', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            res.json({
                'userId': '51a4189acf12e53f79000001',
                'name': 'Misfit',
                'birthday': '1955-07-06',
                'gender': 'female',
                'email': 'help@misfit.com'
            });
        });

        server.get('/move/resource/v1/user/:userId/device', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            res.json({
                'id': '51a4189acf12e53f80000001',
                'deviceType': 'shine',
                'serialNumber':' XXXXXV0011',
                'firmwareVersion': '0.0.50r',
                'batteryLevel': 40
            });
        });

        server.get('/move/resource/v1/user/:userId/activity/goals', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            res.json({
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
            });
        });

        server.get('/move/resource/v1/user/:userId/activity/summary', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            if(req.query.detail === 'true') {
                return res.json({
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
                });
            } else {
                return res.json({
                    'points': 96.4,
                    'steps': 888,
                    'calories': 3132.3888,
                    'activityCalories': 547.1241,
                    'distance': 0.2821
                });
            }
        });

        server.get('/move/resource/v1/user/:userId/activity/sessions', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            res.json({
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
            });
        });

        server.get('/move/resource/v1/user/:userId/activity/sleeps', validateAuthorization, function (req, res) {
            if(req.params.userId !== 'me') {
                return res.json(403, {
                    code: 403,
                    message: 'Forbidden'
                });
            }

            res.json({
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
            });
        });

        this.__defineGetter__('url', function () {
            return server.url;
        });

        this.__defineGetter__('client', function () {
            return VALID_CLIENT;
        });

        this.__defineGetter__('auth', function () {
            return VALID_AUTH;
        });

        this.__defineGetter__('expired', function () {
            return EXPIRED_AUTH;
        });

        this.shutdown = function (callback) {
            server.close(callback);
        }

        server.listen(options.port, '127.0.0.1', callback);
    };

    return misfitMock;
})();


module.exports = MisfitMock;
