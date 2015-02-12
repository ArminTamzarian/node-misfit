# node-misfit

NodeJS library for interfacing with the [Misfit](http://misfit.com/) [Cloud API](https://build.misfit.com/docs/).

[![Build Status](https://travis-ci.org/ArminTamzarian/node-misfit.png?branch=master)](https://travis-ci.org/ArminTamzarian/node-misfit)

## Getting Started

Install the library into node.js:

```
npm install node-misfit
```

```javascript
var misfit = require('node-misfit');
```

Then construct a new misfit handler object and go to town...

```javascript
var misfitHandler = new misfit({
    clientId: process.env.MISFIT_CLIENT_ID,
    clientSecret: process.env.MISFIT_CLIENT_SECRET,
    redirectUri: process.env.MISFIT_REDIRECT_URI
});

var authorizeUrl = misfitHandler.getAuthorizeUrl();

misfitHandler.getProfile(user.accessToken, function(err, profile) {
    console.log(profile);
});
```

## API

### *node-misfit*([`options`])

node-misfit constructor

* `options` - (Object) Configuration options for the node-misfit object
 - `clientId` (String) Client ID for the Misfit API application `Default: ''`
 - `clientSecret` (String) Client secret for the Misfit API application `Default: ''`
 - `redirectUri` (String) URL to redirect the browser to after authorization requests `Default: ''`
 - `scope` (String) Data parameters to which requests should be limited `Default: 'public,birthday,email,tracking,session,sleeps'`


 Example:
 ```javascript
 var misfit = require('node-misfit');

 var misfitHandler = new misfit({
     clientId: process.env.MISFIT_CLIENT_ID,
     clientSecret: process.env.MISFIT_CLIENT_SECRET,
     redirectUri: process.env.MISFIT_REDIRECT_URI
 });
 ```

### getAuthorizeUrl()

Get the authorization URL for the configured node-misfit object

[Misfit - Authorize a 3rd-party app](https://build.misfit.com/docs/references#APIReferences-Authorize3rd-partyapptoaccessShinedata)

Example:
```javascript
misfitHandler.getAuthorizeUrl(); // -> https://api.misfitwearables.com/auth/dialog/authorize?response_type=code&client_id=...
```

### getAccessToken(`authorizationCode`, [`callback`])

Exchange a Misfit API authorization code for an access token

#### Parameters
* `authorizationCode` (String) The authorization code to exchange for an access token
* `callback` (Function(err, token)) Optional callback to execute on completion of the request

#### Throws
* `RequiredParameterError`: Argument `authorizationCode` required

[Misfit - Get access token from authorized code ](https://build.misfit.com/docs/references#APIReferences-Getaccesstokenfromauthorizedcode)

Example:
```javascript
misfitHandler.getAccessToken(user.authCode, function(err, token){
    console.log(token); // -> 'afwfh384hg84uh348g34g8374hga874gh8a374gha8347gha8347'
});
```

### getProfile(`accessToken`, [`options`], [`callback`])

 Get the profile for the specified user.

#### Parameters
 * `accessToken` (String)  - The user's access token to authenticate the request
 * `options` (String) Optional set of options to configure the request.
  - `userId` (String) User id of the profile resource owner. `Default: 'me'`
  - `objectId` (String) Optional id of the specific profile resource to retrieve.
 * `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
 * `RequiredParameterError`: Argument `accessToken` required

 [Misfit - Profile](https://build.misfit.com/docs/references#APIReferences-Profile)

Example:
```javascript
misfitHandler.getProfile(user.accessToken, function(err, profile){
    console.log(profile);
    // -> {
    //      "userId":"51a4189acf12e53f79000001",
    //      "name":"Misfit",
    //      "birthday":"1955-07-06",
    //      "gender":"female",
    //      "email":"help@misfit.com"
    //    }
}
```

### getDevice(`accessToken`, [`options`], [`callback`])

Get the device information for the specified user.

#### Parameters
* `accessToken` (String) The user's access token to authenticate the request
* `options` (String) Optional set of options to configure the request.
 - `userId` (String) User id of the device resource owner. `Default: 'me'`
 - `objectId` (String) Optional id of the specific device resource to retrieve.
* `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
* `RequiredParameterError`: Argument `accessToken` required

[Misfit - Device](https://build.misfit.com/docs/references#APIReferences-Device)

Example:
```javascript
misfitHandler.getDevice(user.accessToken, function(err, device){
    console.log(device);
    // -> {
    //      "id":"51a4189acf12e53f80000001",
    //      "deviceType":"shine",
    //      "serialNumber":"XXXXXV0011",
    //      "firmwareVersion":"0.0.50r",
    //      "batteryLevel":40
    //    }
}
```

### getGoals(`accessToken`, `startDate`, `endDate`, [`options`], [`callback`])

Get the goal information for the specified user.

#### Parameters
* `accessToken` (String) The user's access token to authenticate the request
* `startDate` (String) Start date for the query `Format: 'YYYY-MM-DD'`
* `endDate` (String) End date for the query `Format: 'YYYY-MM-DD'`
* `options` (String) Optional set of options to configure the request.
 - `userId` (String) User id of the goal resource owner. `Default: 'me'`
 - `objectId` (String) Optional id of the specific goal resource to retrieve.
* `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
* `InvalidDateError`: `startDate` and `endDate` must be valid dates in the format `YYYY-MM-DD`
* `InvalidDateRangeError`: `startDate` must precede `endDate` and the duration may not exceed 30 days
* `RequiredParameterError`: Arguments `accessToken`, `startDate`, `endDate` required

[Misfit - Goal](https://build.misfit.com/docs/references#APIReferences-Goal)

Example:
```javascript
misfitHandler.getGoals(user.accessToken, '2013-11-05', '2013-11-08', function(err, goals){
    console.log(goals);
    // -> {
    //      "goals":[
    //        {
    //          "id":"51a4189acf12e53f81000001",
    //          "date":"2013-10-05",
    //          "points":500,
    //          "targetPoints":1000
    //        },
    //        ...
    //      ]
    //    }
}
```

### getSummary(`accessToken`, `startDate`, `endDate`, [`options`], [`callback`])

#### Parameters
* `accessToken` (String) The user's access token to authenticate the request
* `startDate` (String) Start date for the query `Format: 'YYYY-MM-DD'`
* `endDate` (String) End date for the query `Format: 'YYYY-MM-DD'`
* `options` (String) Optional set of options to configure the request.
 - `userId` (String) User id of the summary resource owner. `Default: 'me'`
* `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
* `InvalidDateError`: `startDate` and `endDate` must be valid dates in the format `YYYY-MM-DD`
* `InvalidDateRangeError`: `startDate` must precede `endDate` and the duration may not exceed 30 days
* `RequiredParameterError`: Arguments `accessToken`, `startDate`, `endDate` required

[Misfit - Summary](https://build.misfit.com/docs/references#APIReferences-Summary)

Example:
```javascript
misfitHandler.getSummary(user.accessToken, '2013-11-05', '2013-11-08', function(err, summary){
    console.log(summary);
    // -> {
    //      "summary": [
    //        {
    //          "date": "2013-11-05",
    //          "points": 394.4,
    //          "steps": 3650,
    //          "calories": 1687.4735,
    //          "activityCalories": 412.3124,
    //          "distance": 1.18
    //        },
    //        {
    //          "date": "2013-11-06",
    //          "points": 459.6,
    //          "steps": 4330,
    //          "calories": 1707.8484,
    //          "activityCalories": 412.3124,
    //          "distance": 1.3982
    //        },
    //        ...
    //      ]
    //    }
}
```

### getSessions(`accessToken`, `startDate`, `endDate`, [`options`], [`callback`])

#### Parameters
* `accessToken` (String) The user's access token to authenticate the request
* `startDate` (String) Start date for the query `Format: 'YYYY-MM-DD'`
* `endDate` (String) End date for the query `Format: 'YYYY-MM-DD'`
* `options` (String) Optional set of options to configure the request.
 - `userId` (String) User id of the sessions resource owner. `Default: 'me'`
 - `objectId` (String) Optional id of the specific sessions resource to retrieve.
* `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
* `InvalidDateError`: `startDate` and `endDate` must be valid dates in the format `YYYY-MM-DD`
* `InvalidDateRangeError`: `startDate` must precede `endDate` and the duration may not exceed 30 days
* `RequiredParameterError`: Arguments `accessToken`, `startDate`, `endDate` required

[Misfit - Session](https://build.misfit.com/docs/references#APIReferences-Session)

Example:
```javascript
misfitHandler.getSessions(user.accessToken, '2013-11-05', '2013-11-08', function(err, sessions){
    console.log(sessions);
    //-> {
    //     "sessions":[
    //       {
    //         "id":"51a4189acf12e53f82000001",
    //         "activityType":"Cycling",
    //         "startTime":"2014-05-19T10:26:54-04:00",
    //         "duration":900,
    //         "points":210.8,
    //         "steps":1406,
    //         "calories":25.7325,
    //         "distance":0.5125
    //       },
    //       ...
    //     ]
    //   }
```

### getSleeps(`accessToken`, `startDate`, `endDate`, [`options`], [`callback`])

#### Parameters
* `accessToken` (String) The user's access token to authenticate the request
* `startDate` (String) Start date for the query `Format: 'YYYY-MM-DD'`
* `endDate` (String) End date for the query `Format: 'YYYY-MM-DD'`
* `options` (String) Optional set of options to configure the request.
 - `userId` (String) User id of the sleep resource owner. `Default: 'me'`
 - `objectId` (String) Optional id of the specific sleep resource to retrieve.
* `callback` (Function(err, profile)) Optional callback to execute on completion of the request

#### Throws
* `InvalidDateError`: `startDate` and `endDate` must be valid dates in the format `YYYY-MM-DD`
* `InvalidDateRangeError`: `startDate` must precede `endDate` and the duration may not exceed 30 days
* `RequiredParameterError`: Arguments `accessToken`, `startDate`, `endDate` required

[Misfit - Sleep](https://build.misfit.com/docs/references#APIReferences-Sleep)

Example:
```javascript
misfitHandler.getSleeps(user.accessToken, '2013-11-05', '2013-11-08', function(err, sleeps){
    console.log(sleeps);
    //-> {
    //     "sessions":[
    //       {
    //         "id":"51a4189acf12e53f82000001",
    //         "activityType":"Cycling",
    //         "startTime":"2014-05-19T10:26:54-04:00",
    //         "duration":900,
    //         "points":210.8,
    //         "steps":1406,
    //         "calories":25.7325,
    //         "distance":0.5125
    //       },
    //       ...
    //     ]
    //   }
```

### handleSubscription(`data`, [`callback`])

Handle subscription request from Misfit Cloud API

#### Parameters
* `data` (Object) Subscription Amazon SNS message from Misfit Cloud API
* `callback` (Function(err, sleeps)) Optional callback to execute on completion of the request

#### Throws
* `RequiredParameterError`: Argument `data` required

[Misfit - Confirm subscription ](https://build.misfit.com/docs/references#APIReferences-Confirmsubscription)

Example:
```javascript

```

## Exceptions

### InvalidDateError([`message`])

Error indicating an invalid date has been specified.

* `message` - (String) Optional custom error message.

### InvalidDateRangeError([`message`])

Error indicating an invalid date range has been supplied.

* `message` - (String) Optional custom error message.

### RequiredParameterError(`parameters`)

Error indicating that required parameters for a function has not been provided.

* `parameters` - (Array<String>) Array of missing parameters.

## Testing

```
npm test
```

## Release notes

### 0.1.0

* Initial Release

## License

(The MIT License)

Copyright (c) 2015 Armin Tamzarian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
