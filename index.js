'user strict';

var querystring = require('querystring');
var util = require('util');

var NodeMisfit = (function () {
    var MISFIT_CLOUD_BASE_URL = 'https://api.misfitwearables.com';

    var PATH_AUTH_AUTHORIZE = '/auth/dialog/authorize';

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
    };

    return nodeMisfit;
})();

module.exports = NodeMisfit;
