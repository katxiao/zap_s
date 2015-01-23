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
        $scope.showChangePasswordError = false;
        
        $scope.pointsByCategory = {
            Energy: {
                value: 0,
                question: []
            }, 
            Disposables: {
                value: 0,
                question: []
            },
            Waste: {
                value: 0,
                question: []
            },
            Water: {
                value: 0,
                question: []
            }
        };
        $scope.pointsByCategory["Sustainable Furnishings & Building Materials"] = {
            value: 0,
            question: []
        };
        $scope.pointsByCategory["Pollution & Chemical Reduction"] = {
            value: 0,
            question: []
        };
        $scope.totalPoints = 0;

        $http.get("/current_auth/").then(function(response) {
            var data = response.data;
            if (data.success && data.content.user) {
                $scope.user = data.content.user;
                $scope.admin = $scope.user.admin;
                
                $scope.user.GPs.forEach(function (selection, index) {
                    $http.get('/api/standards/individual/' + selection.question).success(function (standard) {
                        var selection = $scope.user.GPs[index];
                        console.log(index, selection);
                        if ($scope.pointsByCategory[standard.category].value != 0) {
                            //$scope.pointsByCategory[standard.category].value += selection.option * selection.percentage / 100.0;
                            $scope.pointsByCategory[standard.category].questions.push({
                                question: standard.question,
                                value: selection.option * selection.percentage / 100.0
                            });
                        } else {
                            $scope.pointsByCategory[standard.category] = {
                                value: selection.option * selection.percentage / 100.0,
                                questions: [{
                                        question: standard.question,
                                        value: selection.option * selection.percentage / 100.0
                                    }]
                            };
                        }
                    }).then(function () {
                        $scope.categoryKeys = Object.keys($scope.pointsByCategory);
                        $scope.totalPoints = 0;
                        for (var key in $scope.pointsByCategory) {
                            $scope.pointsByCategory[key].value = 0;
                            for (var index in $scope.pointsByCategory[key].questions) {
                                $scope.pointsByCategory[key].value += $scope.pointsByCategory[key].questions[index].value;
                                $scope.totalPoints += $scope.pointsByCategory[key].questions[index].value;
                            }
                        }
                    });
                });
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

        $scope.loginModal = function () {
            $('#loginModal').modal();
        }

        $scope.signUpModal = function() {
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
                    $window.location.href = "/#/profile";
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

        $scope.changePasswordModal = function() {
            $('#changePasswordModal').modal();
        }

        $scope.changePassword = function(oldPassword, newPassword, confirmNewPassword) {
            if (newPassword === confirmNewPassword) {
                $http.post('/client/index/reset', {username: $scope.user.username, oldPassword: oldPassword, newPassword: newPassword})
                .success(function(data) {
                    $('#changePasswordModal').modal('hide');
                    alert("Password successfully changed!");
                }).error(function(err) {
                    console.log('ERR',err);
                    $scope.showChangePasswordError = true;
                    $scope.changePasswordError = err.err ? err.err : "Could not change password.";
                })
            } else {
                $scope.showChangePasswordError = true;
                $scope.changePasswordError = "Passwords do not match!";
            }
        }
        
        $scope.abbrev = function (input) {
            if (input.length < 12)
                return input;
            else
                return input.substring(0, 9) + "...";
        }

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
