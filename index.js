'use strict';

var querystring = require('querystring');
var request = require('superagent');
var util = require('util');

var NodeMisfit = (function () {
    var MISFIT_CLOUD_BASE_URL = 'https://api.misfitwearables.com';
    var MISFIT_DEFAULT_USERID = 'me';

    var PATH_AUTH_AUTHORIZE = '/auth/dialog/authorize';
    var PATH_AUTH_EXCHANGE_TOKEN = '/auth/tokens/exchange';

    var PATH_RESOURCE_PROFILE = '/move/resource/v1/user/%s/profile';
    var PATH_RESOURCE_DEVICE = '/move/resource/v1/user/%s/device';
    var PATH_RESOURCE_GOALS = '/move/resource/v1/user/%s/activity/goals';
    var PATH_RESOURCE_SESSIONS = '/move/resource/v1/user/%s/activity/sessions';
    var PATH_RESOURCE_SLEEPS = '/move/resource/v1/user/%s/activity/sleeps';

    var nodeMisfit = function (options) {
        options = options || {};

        var setup = {
            clientId: options.clientId || '',
            clientSecret: options.clientSecret || '',
            redirectUri: options.redirectUri || '',
            scope: options.scope || 'public,birthday,email,tracking,session,sleeps'
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
                    if(err) {
                        return callback(err);
                    }

                    callback(null, response.body.access_token);
                });
        };

        var getResource = function (accessToken, requestPath, queryParameters, userId, callback) {
            if (typeof(callback) === 'undefined') {
                callback = userId;
                userId = MISFIT_DEFAULT_USERID;
            }

            request
            .get(util.format(requestPath, userId))
            .query(queryParameters)
            .set('Authorization', util.format('Bearer %s', accessToken))
            .end(function (err, response) {
                if (err) {
                    return callback(err);
                }

                callback(null, response.body);
            });
        }

        this.getProfile = function (accessToken, userId, callback) {
            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_PROFILE), {}, userId, callback);
        };

        this.getDevice = function (accessToken, userId, callback) {
            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_DEVICE), {}, userId, callback);
        };

        this.getGoals = function (accessToken, startDate, endDate, userId, callback) {
            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_GOALS), {
                start_date: startDate,
                end_date: endDate
            }, userId, callback);
        };

        this.getSessions = function (accessToken, startDate, endDate, userId, callback) {
            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_SESSIONS), {
                start_date: startDate,
                end_date: endDate
            }, userId, callback);
        };

        this.getSleeps = function (accessToken, startDate, endDate, userId, callback) {
            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_SLEEPS), {
                start_date: startDate,
                end_date: endDate
            }, userId, callback);
        };
    };

    return nodeMisfit;
})();

module.exports = NodeMisfit;
