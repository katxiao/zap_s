//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('profileController', profileController);

    profileController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function profileController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'profileController';
        $scope.message = '';
        $scope.showErrorMessage = false;
        $scope.user = undefined;

        $http.get("/current_auth").then(function(response) {
            var data = response.data;
            if (data.success && data.content.user) {
                $scope.user = data.content.user;
            } else {
                $window.location.href = "/#/";
            }
        });

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }
    }
})();
