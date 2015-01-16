(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('resetController', resetController);

    resetController.$inject = ['$scope', '$http', '$routeParams', '$cookies', '$window', '$location', '$anchorScroll'];

    function resetController($scope, $http, $routeParams, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'resetController';
        $scope.message = '';
        $scope.showErrorMessage = false;
        var fromHexToString = function(hex) {
            var str = "";
            for (var i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return str;
        }
        $scope.username = fromHexToString($routeParams.user);


        $scope.reset = function (username, oldPassword, newPassword) {
            $http.post('/client/index/reset', { username: $scope.username, oldPassword: $scope.oldPassword, newPassword: $scope.newPassword }).success(function (data) {
                $window.location.href = "/#/login";
            }).error(function(err) {
                $scope.message = "Reset unsuccessful. Try again.";
                $scope.showLogInErrorMessage = true;
            });
        };


        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();