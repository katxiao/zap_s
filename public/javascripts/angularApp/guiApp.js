(function () {
    'use strict';

    var app = angular.module('guiApp', [
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
            return input.replace(';', ',');
        }
    });

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/:category', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'categoryController'
                })
                .otherwise('/', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'guiController'
                });
        }
    ])
})();