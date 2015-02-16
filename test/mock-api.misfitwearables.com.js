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


    var misfitMock = function (options, callback) {
        var server = restify.createServer();
        server.use(restify.bodyParser());

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
                        message: "Invalid Access Token"
                    });
                }
            }

            next();
        }


        server.post('/auth/tokens/exchange', validateClient, function (req, res) {

            if (req.body.code === EXPIRED_AUTH.code) {
                return res.json(403, {
                    error: "invalid_grant",
                    error_description: "Authorization code expired"
                });
            }

            if (req.body.code !== VALID_AUTH.code) {
                return res.json(403, {
                    error: "invalid_grant",
                    error_description: "App Id or redirect_uri does not match authorization code"
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
                    message: "Forbidden"
                });
            }

            res.json({
                "userId": "51a4189acf12e53f79000001",
                "name": "Misfit",
                "birthday": "1955-07-06",
                "gender": "female",
                "email": "help@misfit.com"
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

        this.shutdown = function(callback) {
            server.close(callback);
        }

        server.listen(options.port, '127.0.0.1', callback);
    };

    return misfitMock;
})();


module.exports = MisfitMock;
