(function () {
    'use strict';

    var app = angular.module('myApp', [
        // Angular modules 
        'ngAnimate',
        'ngRoute',
        'ngCookies'

        // Custom modules 

        // 3rd Party Modules

    ]);

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
                .otherwise({
                    templateUrl: '/angularviews/home.html',
                    controller: 'homeController'
                })
        }
    ])
})();