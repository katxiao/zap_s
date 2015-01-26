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
        'ui.bootstrap',
        'app'
    ]).filter('tags', function () {
        return function (input, filterObj) {
            return $.grep(input, function (item) {
                var valid = false;
                if (filterObj && item.filters) {
                    if (filterObj.easy) {
                        valid = item.filters.indexOf("Easy") >= 0;
                    }
                    if (filterObj.lowcost && !valid) {
                        valid = item.filters.indexOf("Low Cost") >= 0;
                    }
                    if (filterObj.visible && !valid) {
                        valid = item.filters.indexOf("Visible") >= 0;
                    }
                } else {
                    return true;
                }
                return valid;
            });
        }
    });

    angular.module('numbers', []).filter('maxHundred', function () {
        return function (input) {
            return Math.min(input, 100);
        };
    });

    angular.module('stringFormat', []).filter('reinsertCommas', function () {
        return function (input) {
            if (!input)
                return "";
            return input.replace(/;;/g, ',').replace(/;/g, ',');
        }
    });

    angular.module('app', [])
    .directive('scrollTo', function ($location, $anchorScroll) {
      return function(scope, element, attrs) {

        element.bind('click', function(event) {
            event.stopPropagation();
            var off = scope.$on('$locationChangeStart', function(ev) {
                off();
                ev.preventDefault();
            });
            var location = attrs.scrollTo;
            $location.hash(location);
            $anchorScroll();
        });
        }
    });

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/profile', {
                    templateUrl: '/angularviews/profile.html',
                    controller: 'profileController'
                })
                .when('/admin', {
                    templateUrl: '/angularViews/admin.html',
                    controller: 'adminController'
                })
                .when('/reset', {
                    templateUrl: '/angularviews/reset.html',
                    controller: 'resetController'
                })
                .when('/:category',{
                    templateUrl: '/angularviews/home.html',
                    controller: 'homeController'
                })
                .otherwise({
                    templateUrl: '/angularviews/home.html',
                    controller: 'homeController'
                })

        }
    ])
})();