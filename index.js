/*!
* node-misfit
* Copyright(c) 2015 Armin Tamzarian <tamzarian1989@gmail.com>
* MIT Licensed
*/

'use strict';

var moment = require('moment');
var querystring = require('querystring');
var request = require('superagent');
var util = require('util');

function InvalidDateError(message) {
    this.name = 'InvalidDateError';
    this.message = message
}
InvalidDateError.prototype = Error.prototype;

function InvalidDateRangeError(message) {
    this.name = 'InvalidDateRangeError';
    this.message = message
}
InvalidDateRangeError.prototype = Error.prototype;

function RequiredParameterError(parameters) {
    this.name = 'RequiredParameterError';
    this.message = util.format('Required parameter%s missing: %s', parameters.length > 1 ? '(s)' : '', parameters.join(', '));
}
RequiredParameterError.prototype = Error.prototype;

var NodeMisfit = (function () {
    var MISFIT_CLOUD_BASE_URL = 'https://api.misfitwearables.com';
    var MISFIT_DEFAULT_USERID = 'me';

    var PATH_AUTH_AUTHORIZE = '/auth/dialog/authorize';
    var PATH_AUTH_EXCHANGE_TOKEN = '/auth/tokens/exchange';

    var PATH_RESOURCE_PROFILE = '/move/resource/v1/user/%s/profile';
    var PATH_RESOURCE_DEVICE = '/move/resource/v1/user/%s/device';
    var PATH_RESOURCE_GOALS = '/move/resource/v1/user/%s/activity/goals';
    var PATH_RESOURCE_SUMMARY = '/move/resource/v1/user/%s/activity/summary';
    var PATH_RESOURCE_SESSIONS = '/move/resource/v1/user/%s/activity/sessions';
    var PATH_RESOURCE_SLEEPS = '/move/resource/v1/user/%s/activity/sleeps';

    /**
     * node-misfit constructor
     *
     * Configuration options are as follows:
     *   clientId {String} Client ID for the Misfit API application
     *   clientSecret {String} Client secret for the Misfit API application
     *   redirectUri {String} URL to redirect the browser to after authorization requests
     *   scope {String} Data parameters to which requests should be limited
     *
     * @param {Object} options - Configuration options for the node-misfit object
     * @public
     */
    var nodeMisfit = function (options) {
        options = options || {};

        var setup = {
            clientId: options.clientId || '',
            clientSecret: options.clientSecret || '',
            redirectUri: options.redirectUri || '',
            scope: options.scope || 'public,birthday,email,tracking,session,sleeps'
        };

        /**
        * Checks to see if the supplied object is a function
        *
        * @param {Object obj} Object to test if it is a function
        * @private
        */
        var isFunction = function (obj) {
            return typeof obj == 'function' || false;
        };

        /**
        *
        */
        var checkRequired = function(parameters) {
            var missing = [];
            var parameters = Array.prototype.slice.call(parameters);
            var req = Array.prototype.slice.call(arguments, 1);

            for(var i = 0; i < req.length; i++) {
                if(!parameters[i]) {
                    missing.push(req[i]);
                }
            }

            if(missing.length > 0) {
                throw new RequiredParameterError(missing);
            }

            return true;
        };

        /**
        *
        */
        var validateDates = function (startDate, endDate) {
            var startMoment = moment(startDate, "YYYY-MM-DD");
            var endMoment = moment(endDate, "YYYY-MM-DD");

            if(!startMoment.isValid()) {
                throw new InvalidDateError(util.format('Invalid startDate %s', startDate));
            }

            if(!endMoment.isValid()) {
                throw new InvalidDateError(util.format('Invalid endDate %s', endDate));
            }

            if(endMoment.isBefore(startMoment)) {
                throw new InvalidDateRangeError(util.format('endDate may not precede startDate'));
            }

            if(startMoment.diff(endMoment, 'days') > 30) {
                throw new InvalidDateRangeError(util.format('Date range is greater than 30 days'));
            }
        }
        /**
        * Get a Misfit resource matching the supplied information
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} requestPath - Path for the request
        * @param {Object} queryParameters - Query parameters to include with the request
        * @param {String} userId - Optional id for the user
        * @param {String} objectId - Optional object of the resource
        * @param {Function(err, resource)} callback - Optional callback to execute on completion of the request
        * @private
        */
        var getResource = function (accessToken, requestPath, queryParameters, userId, objectId, callback) {
            userId = userId || MISFIT_DEFAULT_USERID;

            request
                .get(objectId ? util.format(requestPath + '/%s', userId, objectId) : util.format(requestPath, userId))
                .query(queryParameters)
                .set('Authorization', util.format('Bearer %s', accessToken))
                .end(function (err, response) {
                    if(!isFunction(callback)) { return; }

                    if (err) {
                        return callback(err);
                    }

                    callback(null, response.body);
                });
        }

        /**
        * Get the authorization URL for the configured node-misfit object
        *
        * @public
        */
        this.getAuthorizeUrl = function () {
            return util.format('%s%s?%s', MISFIT_CLOUD_BASE_URL, PATH_AUTH_AUTHORIZE, querystring.stringify({
                response_type: 'code',
                client_id: setup.clientId,
                redirect_uri: setup.redirectUri,
                scope: setup.scope
            }));
        };

        /**
        * Exchange a Misfit API authorization code for an access token
        *
        * @param {String} authorizationCode - The authorization code to exchange for an access token
        * @param {Function(err, token)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getAccessToken = function (authorizationCode, callback) {
            checkRequired(arguments, 'authorizationCode');

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
                    if(!isFunction(callback)) { return; }

                    if(err) {
                        return callback(err);
                    }

                    callback(null, response.body.access_token);
                });
        };

        /**
        * Get the profile for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the profile resource owner. If not specified assumed to be 'me'
        *   {String} objectId - Optional id of the specific profile resource to retrieve.
        * @param {Function(err, profile)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getProfile = function (accessToken, options, callback) {
            checkRequired(arguments, 'accessToken');

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_PROFILE), {}, options.userId, options.objectId, callback);
        };

        /**
        * Get the device information for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the device resource owner. If not specified assumed to be 'me'
        *   {String} objectId - Optional id of the specific device resource to retrieve.
        * @param {Function(err, device)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getDevice = function (accessToken, options, callback) {
            checkRequired(arguments, 'accessToken');

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_DEVICE), {}, options.userId, options.objectId, callback);
        };

        /**
        * Get the goal information for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} startDate - Start date for the query (YYYY-MM-DD)
        * @param {String} endDate - End date for the query (YYYY-MM-DD)
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the goal resource owner. If not specified assumed to be 'me'
        *   {String} objectId - Optional id of the specific goal resource to retrieve.
        * @param {Function(err, goals)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getGoals = function (accessToken, startDate, endDate, options, callback) {
            checkRequired(arguments, 'accessToken', 'startDate', 'endDate');
            validateDates(startDate, endDate);

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_GOALS), {
                start_date: startDate,
                end_date: endDate
            }, options.userId, options.objectId, callback);
        };

        /**
        * Get the summary information for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} startDate - Start date for the query (YYYY-MM-DD)
        * @param {String} endDate - End date for the query (YYYY-MM-DD)
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the summary owner. If not specified assumed to be 'me'
        * @param {Function(err, summary)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getSummary = function (accessToken, startDate, endDate, options, callback) {
            checkRequired(arguments, 'accessToken', 'startDate', 'endDate');
            validateDates(startDate, endDate);

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_SUMMARY), {
                start_date: startDate,
                end_date: endDate,
                detail: true
            }, options.userId, undefined, callback);
        };

        /**
        * Get the session information for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} startDate - Start date for the query (YYYY-MM-DD)
        * @param {String} endDate - End date for the query (YYYY-MM-DD)
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the session resource owner. If not specified assumed to be 'me'
        *   {String} objectId - Optional id of the specific session resource to retrieve.
        * @param {Function(err, sessions)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getSessions = function (accessToken, startDate, endDate, options, callback) {
            checkRequired(arguments, 'accessToken', 'startDate', 'endDate');
            validateDates(startDate, endDate);

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_SESSIONS), {
                start_date: startDate,
                end_date: endDate
            }, options.userId, options.objectId, callback);
        };

        /**
        * Get the sleep information for the specified user.
        *
        * @param {String} accessToken - The user's access token to authenticate the request
        * @param {String} startDate - Start date for the query (YYYY-MM-DD)
        * @param {String} endDate - End date for the query (YYYY-MM-DD)
        * @param {String} options - Optional set of options to configure the request.
        *   {String} userId - User id of the sleep resource owner. If not specified assumed to be 'me'
        *   {String} objectId - Optional id of the specific sleep resource to retrieve.
        * @param {Function(err, sleeps)} callback - Optional callback to execute on completion of the request
        * @public
        */
        this.getSleeps = function (accessToken, startDate, endDate, options, callback) {
            checkRequired(arguments, 'accessToken', 'startDate', 'endDate');
            validateDates(startDate, endDate);

            callback = callback || options;
            options = options || {};

            getResource(accessToken, util.format('%s%s', MISFIT_CLOUD_BASE_URL, PATH_RESOURCE_SLEEPS), {
                start_date: startDate,
                end_date: endDate
            }, options.userId, options.objectId, callback);
        };

        /**
        *
        */
        this.handleSubscription = function(data, callback) {
            request
                .get(data.subscribeurl)
                .end(function (err, response) {
                    if(!isFunction(callback)) { return; }

                    callback(err, response);
                });
        }
    };

    return nodeMisfit;
})();

module.exports = NodeMisfit;
module.exports.InvalidDateError = InvalidDateError;
module.exports.InvalidDateRangeError = InvalidDateRangeError;
module.exports.RequiredParameterError = RequiredParameterError;
