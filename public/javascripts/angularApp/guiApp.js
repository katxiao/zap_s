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
    
    var shorten = function (s) {
        return s.substring(0, Math.min(s.length, 6));
    }

    app.service('userService', function () {
        
        var idToIndexMap = {
            Dispos: {},
            Energy: {},
            Food: {},
            Sustai: {},
            Pollut: {},
            Water: {},
            Waste: {}
        };

        var userData = {
            Dispos: [],
            Energy: [],
            Food: [],
            Sustai: [],
            Pollut: [],
            Water: [],
            Waste: []
        };

        var catNames = ['Disposables', 'Energy', 'Food', 'Sustainable Furnishings & Building Materials', 'Pollution & Chemical Reduction', 'Waste', 'Water'];
        
        this.getCatNames = function() {
            return catNames;
        }

        this.user = function () {
            return userData;
        };
        
        this.saveTemp = function (fullfield, data) {
            var shortfield = shorten(fullfield);
            for (var index in data) {
                userData[shortfield].push({ question: data[index]._id, option: 0, percentage: 0, answered: false});
            }
        }; 
        
        this.saveTempItem = function (fullfield, item, index){
            var shortfield = shorten(fullfield);
            userData[shortfield][index] = item;
        }

        this.getTemp = function (fullfield) {
            var shortfield = shorten(fullfield);
            return userData[shortfield];
        };
        this.getTempOption = function (fullfield, index) {
            var shortfield = shorten(fullfield);
            return userData[shortfield][index];
        };

        this.isEmpty = function (fullfield) {
            var shortfield = shorten(fullfield);
            return userData[shortfield].length === 0;
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