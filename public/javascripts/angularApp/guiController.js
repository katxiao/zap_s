//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('guiApp')
        .controller('guiController', guiController);

    guiController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll', '$routeParams', 'userService'];

    function guiController($scope, $http, $cookies, $window, $location, $anchorScroll, $routeParams, userService) {
        $scope.modalInit = 'hide';
        $scope.interactive = true;

        $scope.pointsEarned = 0;
        $scope.minRequired = 10;

        $scope.index = 0;
        $scope.previousPoints = 0;

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            $scope.admin = $scope.user ? $scope.user.admin : undefined;
            if ($scope.user) {
                $scope.greenPoints = $scope.user.GPs;
                initializeAllBars();
            }
            $http.get('/api/standards/').success(function (data) {
                $scope.standards = data;
                for (var i = 0; i < $scope.standards.length; i++) {
                    var found = false;
                    if ($scope.user) {
                        for (var j = 0; j < $scope.greenPoints.length; j++) {
                            if ($scope.standards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                found = true;
                                $scope.standards[i].option = $scope.greenPoints[j].option;
                                $scope.standards[i].percentage = $scope.greenPoints[j].percentage;
                                $scope.greenPoints[j].matched = true;
                                break;
                            }
                        }
                        if (!found) {
                            $scope.standards[i].option = undefined;
                            $scope.standards[i].percentage = undefined;
                        }
                    }
                }
            });
        });

        var initializeBar = function (category, pointsEarned) {
            console.log('initalizing bar',category)
            var bar = document.getElementById(shorten(category) + 'Bar');
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            if (pointsEarned >= $scope.minRequired)
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", pointsEarned);
            var barjQ = $('#' + shorten(category) + 'Bar');
            barjQ.width(Math.min(pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
            if (pointsEarned * 100.0 / $scope.minRequired > 50) {
                barjQ.html('<a href="/gui/#/' + category + '">' + category + ' (' + pointsEarned + '/' + $scope.minRequired + ')</a>');
                $('#' + shorten(category) + 'BarAfter').html("");
            } else {
                barjQ.html("");
                $('#' + shorten(category) + 'BarAfter').html('<a href="/gui/#/' + category + '">' + category + '</a>');
            }
        }
        
        var initializeAllBars = function() {
            var catNames = userService.getCatNames();
            for (var i = 0; i < catNames.length; i++) {
                var tempCategory = catNames[i];
                $http.get('/api/standards/' + tempCategory).success(function (data) {
                    var catStandards = data;
                    var catPointsEarned = 0;
                    for (var i = 0; i < catStandards.length; i++) {
                        if ($scope.user) {
                            for (var j = 0; j < $scope.greenPoints.length; j++) {
                                if (catStandards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                    catPointsEarned += $scope.greenPoints[j].option * $scope.greenPoints[j].percentage / 100.0;
                                    break;
                                }
                            }
                        }
                    }
                    if (catStandards.length > 0) {
                        initializeBar(catStandards[0].category, catPointsEarned);
                    }
                });
            }
        }
        
        
        $scope.computeMaxPossible = function (standards) {
            var max = 0;
            for(var index in standards) {
                var options = standards[index].optionList;
                var optionMax = 0;
                for(var i in options)
                {
                    if (options[i].points > optionMax)
                        optionMax = options[i].points;
                }
                max += Number(optionMax);
            }
            return max;
        }
        
        var shorten = function (s) {
            return s.substring(0, Math.min(s.length, 6));
        }

        $scope.moveLeft = function () {
            if($scope.index > 0)
            {
                $scope.index -= 1;
                $scope.previousPoints = $scope.standards[$scope.index].choice || 0;
            }
        }

        $scope.moveRight = function () {
            if ($scope.index < ($scope.standards.length - 1)) {
                $scope.index += 1;
                $scope.previousPoints = $scope.standards[$scope.index].choice || 0;
            }
        }

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
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
                    $window.location.href = "/list/#/profile";
                }).error(function(err) {
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

        var validateForm = function(username) {
            var x = username;
            var atpos = x.indexOf("@");
            var dotpos = x.lastIndexOf(".");
            if (atpos< 1 || dotpos<atpos+2 || dotpos+2>=x.length) {
                return false;
            }
            return true;
        }


        activate();

        function activate() { }
    }
})();
