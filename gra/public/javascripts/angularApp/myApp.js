(function () {
    'use strict';

    var app = angular.module('myApp', [
        // Angular modules 
        'ngAnimate',
        'ngRoute',
        'ngCookies',

        // Custom modules 
        'numbers'
        // 3rd Party Modules

    ]);

    angular.module('numbers', []).filter('maxHundred', function () {
        return function (input) {
            return Math.min(input, 100);
        };
    });

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/profile', {
                    templateUrl: '/angularviews/profile.html',
                    controller: 'profileController'
                })
                .when('/login', {
                    templateUrl: '/angularviews/login.html',
                    controller: 'loginController'
                })
                .when('/gui', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'guiController'
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