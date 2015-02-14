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

    var misfitMock = function (options, callback) {
        var server = restify.createServer();
        server.use(restify.bodyParser());

        server.use(function(req, res, next){
            if(req.body.client_id !== VALID_CLIENT.id || req.body.client_secret !== VALID_CLIENT.secret) {
                return res.send(401);
            }

            next();
        });

        server.post('/auth/tokens/exchange', function(req, res) {

            if (req.body.code !== VALID_AUTH.code){
                res.json(403, {
                    error: "invalid_grant",
                    error_description: "App Id or redirect_uri does not match authorization code"
                });
            }

            res.json({
                access_token: VALID_AUTH.token,
                token_type: 'bearer'
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

        server.listen(options.port, '127.0.0.1', callback);
    };

    return misfitMock;
})();


module.exports = MisfitMock;
