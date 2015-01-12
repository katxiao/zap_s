﻿//Author: Jamar Brooks
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
                $scope.user = data.content.user[0];
            } else {
                $window.location.href = "/#/login";
            }
        });
        
        $scope.login = function() {
            $window.location.href = "/#/login";
        }

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#/gui'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }
    }
})();
