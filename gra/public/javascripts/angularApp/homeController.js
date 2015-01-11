//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('homeController', homeController);

    homeController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function homeController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'homeController';
        
        $scope.pointsEarned = 0;
        $scope.minRequired = 80;

        $http.get('/api/standards/Energy').success(function (data) {
            $scope.standards = data;
        });

        $scope.login = function() {
            $window.location.href = "/#/login";
        }

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();
