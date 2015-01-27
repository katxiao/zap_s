(function () {
    'use strict';

    var app = angular.module('homeApp', [
        // Angular modules 
        'ngAnimate',
        'ngRoute',
        'ngCookies',

        'tutorial'

    ]);

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/angularviews/orientation.html',
                    controller: 'orientationController'
                }).
                when('/profile', {
                    templateUrl: '/angularviews/profile.html',
                    controller: 'profileController'
                })
                .otherwise({
                    templateUrl: '/angularviews/orientation.html',
                    controller: 'orientationController'
                })

        }
    ])
})();