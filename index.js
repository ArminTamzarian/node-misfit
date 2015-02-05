'use strict';

var querystring = require('querystring');
var request = require('superagent');
var util = require('util');

var NodeMisfit = (function () {
    var MISFIT_CLOUD_BASE_URL = 'https://api.misfitwearables.com';
    var MISFIT_HEADER_ACCESS_TOKEN = 'access_token';
    var MISFIT_DEFAULT_USERID = 'me';

    var PATH_AUTH_AUTHORIZE = '/auth/dialog/authorize';
    var PATH_AUTH_EXCHANGE_TOKEN = '/auth/tokens/exchange';

    var PATH_RESOURCE_PROFILE = '/move/resource/v1/user/%s/profile';

    var nodeMisfit = function (options) {
        options = options || {};

        var setup = {
            clientId: options.clientId || '',
            clientSecret: options.clientSecret || '',
            redirectUri: options.redirectUri || '',
            scope: options.scope || 'public,birthday,email'
        };

        this.getAuthorizeUrl = function () {
            return util.format('%s%s?%s', MISFIT_CLOUD_BASE_URL, PATH_AUTH_AUTHORIZE, querystring.stringify({
                response_type: 'code',
                client_id: setup.clientId,
                redirect_uri: setup.redirectUri,
                scope: setup.scope
            }));
        };

        this.getAccessToken = function (authorizationCode, callback) {
            request
                .post(util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_AUTH_EXCHANGE_TOKEN))
                .send({
                    grant_type: 'authorization_code',
                    code: authorizationCode,
                    redirect_uri: setup.redirectUri,
                    client_id: setup.clientId,
                    client_secret: setup.clientSecret
                })
                .end(function (err, response) {
                    console.log(response);

                    if(err) {
                        return callback(err);
                    }

                    callback(null, response.body.access_token);
                });
        };

        this.getProfile = function (accessToken, userId, callback) {
            if (typeof(callback) === 'undefined') {
                callback = userId;
                userId = MISFIT_DEFAULT_USERID;
            }

            var resourceUrl = util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_PROFILE);

            request
                .get(util.format(resourceUrl, userId))
                .set(MISFIT_HEADER_ACCESS_TOKEN, accessToken)
                .end(function (err, response) {
                    console.log(response);
                    if (err) {
                        return callback(err);
                    }

                    callback(null, JSON.parse(response.text));
                });
        };
    };

    return nodeMisfit;
})();

module.exports = NodeMisfit;
