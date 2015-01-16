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
            if (username === undefined || password === undefined) {
                $scope.message = "All fields must be filled out.";
                $scope.showLogInErrorMessage = true;
                $scope.showErrorMessage = true;
            } else {
                $http.post('/login', { username: username, password: password }).success(function (data) {
                    $window.location.href = "/#/profile";
                }).error(function(err) {
                    $scope.message = "Login unsuccessful. Try again.";
                    $scope.showLogInErrorMessage = true;
                });
            }
        };

        $scope.signup = function (username, password, confpassword) {
            if (username === undefined || password === undefined || confpassword === undefined) {
                $scope.message = "All fields must be filled out.";
                $scope.showSignUpErrorMessage = true;
                $scope.showErrorMessage = true;
            } else if (!validateForm(username)) {
                $scope.message = "Username must be an email";
                $scope.showSignUpErrorMessage = true;
                $scope.showErrorMessage = true;
            } else {
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
                        $scope.showErrorMessage = true;
                    });
                } else {
                    $scope.message = "Password and confirmation password do not match. Try again.";
                    $scope.showSignUpErrorMessage = true;
                    $scope.showErrorMessage = true;
                };
            }

        };

        var validateForm = function(username) {
            var x = username;
            var atpos = x.indexOf("@");
            var dotpos = x.lastIndexOf(".");
            if (atpos< 1 || dotpos<atpos+2 || dotpos+2>=x.length) {
                return false;
            }
            return true;
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
