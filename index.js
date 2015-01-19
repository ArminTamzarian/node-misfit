'user strict';

var querystring = require('querystring');
var request = require('superagent');
var util = require('util');

var NodeMisfit = (function () {
    var MISFIT_CLOUD_BASE_URL = 'https://api.misfitwearables.com';

    var PATH_AUTH_AUTHORIZE = '/auth/dialog/authorize';
    var PATH_AUTH_EXCHANGE_TOKEN = '/auth/tokens/exchange';

    var nodeMisfit = function (options) {
        options = options || {};

        var setup = {
            clientId: options.clientId || '',
            clientSecret: options.clientSecret || '',
            redirectUri: options.redirectUri || '',
            scope: options.scope || 'public,birthday,email'
        };

        this.getAuthorizeUrl = function() {
            return util.format('%s%s?%s', MISFIT_CLOUD_BASE_URL, PATH_AUTH_AUTHORIZE, querystring.stringify({
                response_type: 'code',
                client_id: setup.clientId,
                redirect_uri: setup.redirectUri,
                scope: setup.scope
            }));
        };

        this.getAccessToken = function(code, callback) {
            request
                .post(util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_AUTH_EXCHANGE_TOKEN))
                .send({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: setup.redirectUri,
                    client_id: setup.clientId,
                    client_secret: setup.clientSecret
                })
                .end(function (err, response) {
                    if(err) {
                        return callback(err);
                    }

                    callback(null, response);
                });
        };
    };

    return nodeMisfit;
})();

module.exports = NodeMisfit;
