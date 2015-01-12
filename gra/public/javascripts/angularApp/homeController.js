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

        $scope.goToGUI = function() {
            $window.location.href = '/#/gui';
        }

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#/login'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();
