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
                when('/member/:id', {
                    templateUrl: '/angularviews/profile.html',
                    controller: 'profileController'
                })
                .otherwise({
                    templateUrl: '/angularviews/home.html',
                    controller: 'homeController'
                })
        }
    ])
})();