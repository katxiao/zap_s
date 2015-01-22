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
            if (input)
                return input.replace(/;;/g, ',').replace(/;/g, ',');
            else
                return "";
        }
    });
    
    app.service('userService', function () {
        var userData = {
            Dispos: [],
            Energy: [],
            Food: [],
            Sustai: [],
            Pollut: [],
            Water: [],
            Waste: [],};
        
        this.user = function () {
            return userData;
        };
        
        this.saveTemp = function (field, data) {
            for (var index in data) {
                userData[field].push({ question: data[index]._id, option: 0, percentage: 0, answered: false});
            }
        }; 
        
        this.saveTempItem = function (field, item, index){
            userData[field][index] = item;
        }

        this.getTemp = function (field) {
            return userData[field];
        };
        this.getTempOption = function (field, index) {
            return userData[field][index];
        };

        this.isEmpty = function (field) {
            return userData[field].length === 0;
        }
    });

    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/angularviews/defaultGUI.html',
                    controller: 'guiController'})
                .when('/:category', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'categoryController'
                })
                .when('/:room/:item', {
                    templateUrl: '/angularviews/gui.html',
                    controller: 'itemController'
                })
                .otherwise({
                    templateUrl: '/angularviews/defaultGUI.html',
                    controller: 'guiController'
                });
        }
    ])
})();