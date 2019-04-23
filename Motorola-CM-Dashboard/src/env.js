(function (window) {
    window.__env = window.__env || {};

    // API url
    // window.__env.apiUrl = 'http://dev.your-api.com';

    // Whether or not to enable debug mode
    // Setting this to false will disable console output
    window.__env.enableDebug = true;
    //This must be same as of node app enviroment file APP_SECRET
    window.__env.app_secret='e0caa12259a5b2d946b9e0c96c346b35';
}(this));