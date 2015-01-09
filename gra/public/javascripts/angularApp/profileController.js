//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('profileController', profileController);

    profileController.$inject = ['$scope', '$http', '$cookies'];

    function profileController($scope, $http, $cookies) {
        $scope.title = 'profileController';
        
        $scope.login = function() {
            $window.location.href = "/#/login";
        }
    }
})();
