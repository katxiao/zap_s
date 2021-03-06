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
        $scope.profile = true;
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

        $scope.makeAdmin = function(clientId) {
            $http.put("/client/index", {clientId: clientId, admin: true}).success(function(data) {
                $http.get("/client/index").then(function(response) {
                    $scope.allUsers = response.data.content.clients;
                })
            }).error(function(err) {
                $scope.message = "Action unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.removeAdmin = function(clientId) {
            $http.put("/client/index", {clientId: clientId, admin: false}).success(function(data) {
                $http.get("/client/index").then(function(response) {
                    $scope.allUsers = response.data.content.clients;
                })
            }).error(function(err) {
                $scope.message = "Action unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.forgotPasswordModal = function() {
            $('#loginModal').modal('hide');
            $('#forgotPasswordModal').modal();
        }

        $scope.resetPassword = function(email) {
            $http.post("/client/index/email", {username: email})
            .success(function(data) {
                $scope.forgotPasswordEmail = '';
                alert("Reset link sent to your email!");
                $('#forgotPasswordModal').modal('hide');
            }).error(function(err) {
                $scope.forgotPasswordMessage = err.err ? err.err : "Unsuccessful."
                $scope.showForgotPasswordMessage = true;
            })
        }

        $scope.loginModal = function () {
            $('#signUpModal').modal('hide');
            $('#loginModal').modal();
        }

        $scope.signUpModal = function() {
            $('#loginModal').modal('hide');
            $('#signUpModal').modal();
        }

        $scope.login = function (username, password) {
            if (username === undefined || password === undefined) {
                $scope.message = "All fields must be filled out.";
                $scope.showLogInErrorMessage = true;
                $scope.showErrorMessage = true;
            } else {
                $http.post('/login', { username: username, password: password }).success(function (data) {
                    $('#modal').modal('hide');
                    $window.location.href = "list/#/profile";
                }).error(function (err) {
                    $scope.logInErrorMessage = "Login unsuccessful. Try again.";
                    $scope.showLogInErrorMessage = true;
                });
            }
        };
        
        $scope.signup = function (username, password, confpassword, city, state, zipcode, organization) {
            if (organization === undefined || username === undefined || password === undefined || confpassword === undefined || city === undefined || state === undefined || zipcode === undefined) {
                $scope.message = "All fields must be filled out.";
                $scope.showLogInErrorMessage = true;
            } else if (!validateForm(username)) {
                $scope.logInErrorMessage = "Username must be an email";
                $scope.showLogInErrorMessage = true;
            } else {
                if(confpassword === password) {
                    $http.post("/client/index", {username: username, password: password, organization: organization, city: city, state: state, zipcode: zipcode}).success(function(data) {
                        $scope.usernamesignup = "";
                        $scope.passwordsignup = "";
                        $scope.confirmpassword = "";
                        $scope.organization = "";
                        $scope.city = "";
                        $scope.state = "";
                        $scope.zipcode = "";
                        $('#signUpModal').modal('hide');
                        $scope.login(username, password);
                    }).error(function(err) {
                        $scope.message = "Registration unsuccessful. Try again.";
                        $scope.showLogInErrorMessage = true;
                    });
                } else {
                    $scope.logInErrorMessage = "Password and confirmation password do not match. Try again.";
                    $scope.showLogInErrorMessage = true;
                };
            }

        };
        
        var validateForm = function (username) {
            var x = username;
            var atpos = x.indexOf("@");
            var dotpos = x.lastIndexOf(".");
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
                return false;
            }
            return true;
        }
    }
})();
