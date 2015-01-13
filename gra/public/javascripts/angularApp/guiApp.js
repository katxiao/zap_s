(function () {
    'use strict';

    var app = angular.module('guiApp', [
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
                when('/', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'guiController'
                });
        }
    ])
})();