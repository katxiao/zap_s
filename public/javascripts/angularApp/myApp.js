(function () {
    'use strict';

    var app = angular.module('myApp', [
        // Angular modules 
        'ngAnimate',
        'ngRoute',
        'ngCookies',

        // Custom modules 
        'numbers',
        'stringFormat',
        // 3rd Party Modules
        'ui.bootstrap'
    ]);

    angular.module('numbers', []).filter('maxHundred', function () {
        return function (input) {
            return Math.min(input, 100);
        };
    });

    angular.module('stringFormat', []).filter('reinsertCommas', function () {
        return function (input) {
            return input.replace(/;;/g, ',').replace(/;/g, ',');
        }
    });

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/profile', {
                    templateUrl: '/angularviews/profile.html',
                    controller: 'profileController'
                })
                .when('/gui', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'guiController'
                })
                .when('/admin', {
                    templateUrl: '/angularViews/admin.html',
                    controller: 'adminController'
                })
                .when('/reset', {
                    templateUrl: '/angularviews/reset.html',
                    controller: 'resetController'
                })
                .otherwise({
                    templateUrl: '/angularviews/home.html',
                    controller: 'homeController'
                })
        }
    ])
})();