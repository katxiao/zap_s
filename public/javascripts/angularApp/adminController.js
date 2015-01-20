(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('adminController', adminController);

    adminController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function adminController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'adminController';
        $scope.message = '';
        $scope.showErrorMessage = false;
        $scope.user = undefined;
        $scope.admin = undefined;
        $scope.allUsers = [];

        $http.get("/current_auth").then(function(response) {
            var data = response.data;
            if (data.success && data.content.user) {
                $scope.user = data.content.user;
                $scope.admin = data.content.user.admin;
                if (!$scope.admin) {
                    $window.location.href = "/#/";
                }
                $http.get("/client/index").then(function(response) {
                    $scope.allUsers = response.data.content.clients;
                })
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
