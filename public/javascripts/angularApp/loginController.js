(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function loginController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'loginController';
        $scope.message = '';
        $scope.showErrorMessage = false;
        $scope.showSignUpErrorMessage = false;
        $scope.showLogInErrorMessage = false;
        
        $http.get("/current_auth").then(function(response) {
            var data = response.data;
            if (data.success && data.content.user) {
                $window.location.href = "/#/profile";
            }
        });

        $scope.login = function (username, password) {
            $http.post('/login', { username: username, password: password }).success(function (data) {
                $window.location.href = "/#/profile";
            }).error(function(err) {
                $scope.message = "Login unsuccessful. Try again.";
                $scope.showLogInErrorMessage = true;
            });
        };

        $scope.signup = function (username, password, confpassword) {
            if(confpassword === password) {
                $http.post("/client/index", {username: username, password: password}).success(function(data) {
                    $scope.usernamesignup = "";
                    $scope.passwordsignup = "";
                    $scope.confirmpassword = "";
                    $('#signUpModal').modal('hide');
                    $window.location.href = "/#/login";
                }).error(function(err) {
                    $scope.message = "Registration unsuccessful. Try again.";
                    $scope.showSignUpErrorMessage = true;
                });
            } else {
                $scope.message = "Password and confirmation password do not match. Try again.";
                $scope.showErrorMessage = true;
            };
        };

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