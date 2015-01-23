//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('homeController', homeController);

    homeController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll', '$routeParams'];

    function homeController($scope, $http, $cookies, $window, $location, $anchorScroll, $routeParams) {
        $scope.title = 'homeController';
        $scope.user = undefined;
        $scope.logInErrorMessage = '';
        $scope.showLogInErrorMessage = false;
        
        $scope.pointsEarned = 0;
        
        $scope.twoStar = 100;
        $scope.threeStar = 175;
        $scope.fourStar = 240;

        $scope.standardsByCategory = {};
        $scope.categoryKeys = [];

        $http.get('/current_auth').success(function(data) {
            $scope.user = data.content.user;
            if ($scope.user) {
                $scope.admin = $scope.user.admin;
                $scope.greenPoints = $scope.user.GPs;
            }
            $http.get('/api/standards/').success(function (data) {
                $scope.standards = data;
                for (var i = 0; i < $scope.standards.length; i++) {
                    var found = false;
                    $scope.standards[i].previousPoints = 0;
                    if ($scope.user) {
                        for (var j = 0; j < $scope.greenPoints.length; j++) {
                            if ($scope.standards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                found = true;
                                $scope.standards[i].option = $scope.greenPoints[j].option;
                                $scope.standards[i].percentage = $scope.greenPoints[j].percentage;
                                $scope.pointsEarned += $scope.greenPoints[j].option * $scope.greenPoints[j].percentage / 100.0;
                                break;
                            }
                        }
                        if (!found) {
                            $scope.standards[i].option = undefined;
                            $scope.standards[i].percentage = undefined;
                        }
                    }
                    if ($scope.standardsByCategory[$scope.standards[i].category]) {
                        $scope.standardsByCategory[$scope.standards[i].category].push($scope.standards[i]);
                    } else {
                        $scope.standardsByCategory[$scope.standards[i].category] = [$scope.standards[i]];
                        $scope.categoryKeys.push($scope.standards[i].category);
                    }
                }
                initializeBar();
            });
        });
        
        var initializeBar = function () {
            var bar = document.getElementById('TotalBar');
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            if ($scope.pointsEarned >= $scope.fourStar)
                $('#TotalBar').addClass('progress-bar-info');
            else if ($scope.pointsEarned >= $scope.threeStar)
                $('#TotalBar').addClass('progress-bar-primary');
            else if ($scope.pointsEarned >= $scope.twoStar)
                $('#TotalBar').addClass('progress-bar-success');
            else
                $('#TotalBar').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#TotalBar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
            if ($scope.pointsEarned >= $scope.fourStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **4-Star**');
            else if ($scope.pointsEarned >= $scope.threeStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **3-Star**');
            else if ($scope.pointsEarned >= $scope.twoStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.threeStar + ') **2-Star**');
            else
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.twoStar + ')');
        }

        
        $scope.computeScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            var bar = document.getElementById('TotalBar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            $scope.standardsByCategory[category][answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            console.log(Number(score), (Number(percent || 100) / 100.0), Number(score) * (Number(percent || 100) / 100.0));
            $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Number(Number(100)/100.0) - Number(previousPoints);
            if ($scope.pointsEarned >= $scope.fourStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-success').addClass('progress-bar-info');
            else if ($scope.pointsEarned >= $scope.threeStar)
                $('#TotalBar').removeClass('progress-bar-info').removeClass('progress-bar-danger').removeClass('progress-bar-success').addClass('progress-bar-primary');
            else if ($scope.pointsEarned >= $scope.twoStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-info').addClass('progress-bar-success');
            else
                $('#TotalBar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#TotalBar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
            if ($scope.pointsEarned >= $scope.fourStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **4-Star**');
            else if ($scope.pointsEarned >= $scope.threeStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **3-Star**');
            else if ($scope.pointsEarned >= $scope.twoStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.threeStar + ') **2-Star**');
            else
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.twoStar + ')');

            //var catbar = document.getElementById(category + 'Bar');
            //var catPE = catbar.getAttribute("aria-valuenow");
            //var minRequired = catbar.getAttribute("aria-valuemax");
            //catPE = Number(catPE) + Number(score) - Number(previousPoints);
            //$scope.previousPoints = Number(score);
            //if (catPE >= minRequired)
            //    $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            //else
            //    $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            //catbar.setAttribute("aria-valuenow", catPE);
            //var catbarjQ = $('#' + shorten(category) + 'Bar');
            //catbarjQ.width(Math.min(catPE * 100.0 / minRequired, 100) + "%");
            //if (catPE * 100.0 / minRequired > 50) {
            //    catbarjQ.html('<span>' + category + ' (' + catPE + '/' + minRequired + ')</span>');
            //    //$('#' + shorten(category) + 'BarAfter').html("");
            //} else {
            //    catbarjQ.html("");
            //    //$('#' + shorten(category) + 'BarAfter').html('<a href="/gui/#/' + category + '">' + category + '</a>');
            //}
        }
        
        $scope.computePercentScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            var bar = document.getElementById('TotalBar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            $scope.standardsByCategory[category][answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            if ($scope.pointsEarned >= $scope.fourStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-success').addClass('progress-bar-info');
            else if ($scope.pointsEarned >= $scope.threeStar)
                $('#TotalBar').removeClass('progress-bar-info').removeClass('progress-bar-danger').removeClass('progress-bar-success').addClass('progress-bar-primary');
            else if ($scope.pointsEarned >= $scope.twoStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-info').addClass('progress-bar-success');
            else
                $('#TotalBar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#TotalBar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
            if ($scope.pointsEarned >= $scope.fourStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **4-Star**');
            else if ($scope.pointsEarned >= $scope.threeStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **3-Star**');
            else if ($scope.pointsEarned >= $scope.twoStar)
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.threeStar + ') **2-Star**');
            else
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.twoStar + ')');
        }
        
        var shorten = function (s) {
            return s.substring(0, Math.min(s.length, 6));
        }

        $scope.goToGUI = function() {
            $window.location.href = '/gui/#/';
        }

        $scope.save = function() {
            if ($scope.user) {
                for (var i = 0; i < $scope.standards.length; i++) {
                    if ($scope.standards[i].option) {
                        $scope.standards[i].percentage = $scope.standards[i].percentage ? $scope.standards[i].percentage : 100;
                        $http.put('/api/standards', {standardId : $scope.standards[i]._id, selectedOption : parseFloat($scope.standards[i].option), percentage : $scope.standards[i].percentage})
                        .then(function(response){});
                    }
                }
                //$window.location.href = '/#/';
                //alert("Selections been saved!")
                $scope.showProgressModalError = true;
                $scope.progressModalError = 'Selections have been saved!';
            } else {
                $scope.signUpModal();
            }

        }

        $scope.loginModal = function () {
            $('#signUpModal').modal('hide');
            $('#progressModal').modal('hide');
            $('#loginModal').modal();
        }

        $scope.signUpModal = function() {
            $('#progressModal').modal('hide');
            $('#loginModal').modal('hide');
            $('#signUpModal').modal();
        }

        $scope.progressModal = function() {
            $('#loginModal').modal('hide');
            $('#signUpModal').modal('hide');
            $('#progressModal').modal();
        }

        $scope.forgotPasswordModal = function() {
            $('#loginModal').modal('hide');
            $('#forgotPasswordModal').modal();
        }

        $scope.forgotPassword = function(email) {
            // TODO
        }

        $scope.logout = function() {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        // $scope.scrollTo = function (id) {
        //     $location.hash(id);
        //     $anchorScroll();
        // }

        $scope.login = function (username, password) {
            if (username === undefined || password === undefined) {
                $scope.message = "All fields must be filled out.";
                $scope.showLogInErrorMessage = true;
                $scope.showErrorMessage = true;
            } else {
                $http.post('/login', { username: username, password: password }).success(function (data) {
                    $('#modal').modal('hide');
                    $window.location.href = "/#/profile";
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
                        //$scope.login(username, password);
                        $http.post('/login', { username: username, password: password }).success(function (data) {
                            $scope.user = data.content.user;
                            $scope.greenPoints = $scope.user.GPs;
                            $http.get('/api/standards/').success(function (data) {
                                $scope.standards = data;
                                for (var i = 0; i < $scope.standards.length; i++) {
                                    var found = false;
                                    $scope.standards[i].previousPoints = 0;
                                    if ($scope.user) {
                                        for (var j = 0; j < $scope.greenPoints.length; j++) {
                                            if ($scope.standards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                                found = true;
                                                $scope.standards[i].option = $scope.greenPoints[j].option;
                                                $scope.standards[i].percentage = $scope.greenPoints[j].percentage;
                                                $scope.pointsEarned += $scope.greenPoints[j].option * $scope.greenPoints[j].percentage / 100.0;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            $scope.standards[i].option = undefined;
                                            $scope.standards[i].percentage = undefined;
                                        }
                                    }
                                    if ($scope.standardsByCategory[$scope.standards[i].category]) {
                                        $scope.standardsByCategory[$scope.standards[i].category].push($scope.standards[i]);
                                    } else {
                                        $scope.standardsByCategory[$scope.standards[i].category] = [$scope.standards[i]];
                                        $scope.categoryKeys.push($scope.standards[i].category);
                                    }
                                }
                            });
                            $scope.save();
                            $('#modal').modal('hide');
                            $window.location.href = "/#/profile";
                        }).error(function(err) {
                            $scope.message = "Registration unsuccessful. Try again.";
                            $scope.showLogInErrorMessage = true;
                        });
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

        var fromStringToHex = function(str) {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                hex += str.charCodeAt(i).toString(16);
            }
            return hex;
        }
        // activate();

        // function activate() { }
    }
})();
