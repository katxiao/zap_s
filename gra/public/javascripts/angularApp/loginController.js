(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope', '$http', '$cookies'];

    function loginController($scope, $http, $cookies) {
        $scope.title = 'loginController';
        $scope.message = '';
        $scope.showErrorMessage = false;
        
        // $http.get("/current_auth").then(function(response) {
        //     var data = response.data;
        //     if (data.success && data.content.user) {
        //         $window.location.href = "/#/member/"+data.content.user._id;
        //     }
        // });

        $scope.login = function (username, password) {
            $http.post('/login', { username: username, password: password }).success(function (data) {
                $window.location.href = "/#/member/"+data.content.user_id;
            }).error(function(err) {
                $scope.message = "Login unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            });
        };

        $scope.signup = function (username, password, confpassword) {
            if(confpassword === password) {
                $http.post("/api/user", {username: username, password: password}).success(function(data) {
                    $scope.usernamesignup = "";
                    $scope.passwordsignup = "";
                    $scope.confirmpassword = "";
                    $window.location.href = "/#/login";
                }).error(function(err) {
                    $scope.message = "Registration unsuccessful. Try again.";
                    $scope.showErrorMessage = true;
                });
            } else {
                $scope.message = "Password and confirmation password do not match. Try again.";
                $scope.showErrorMessage = true;
            };
        };

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();
