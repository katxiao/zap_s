//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('guiApp')
        .controller('categoryController', categoryController);

    categoryController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$routeParams', 'userService'];

    function categoryController($scope, $http, $cookies, $window, $location, $routeParams, userService) {
        $scope.modalInit = 'hide';
        $scope.filtering = 'hide';
        $scope.interactive = true;

        $scope.pointsEarned = 0;
        $scope.minRequired = 10;
        $scope.progressstatus = 'danger';

        var countNotFound = 0;

        $scope.index = 0;
        $scope.previousPoints = 0;
        
        $scope.etcs = {
            legislation: {
                header: 'Legislation',
                open: true
            },
            ecofacts: {
                header: 'EcoFacts',
                open: true
            },
            rebateincentives: {
                header: 'Rebates/Incentives', 
                open: true
            },
            solutions: {
                header: 'Product Solutions',
                open: true
            }
        }

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            if ($scope.user) {
                $scope.admin = $scope.user.admin;
                $scope.greenPoints = $scope.user.GPs;
            }
            $http.get('/api/standards/' + $routeParams.category).success(function (data) {
                $scope.standards = data;
                console.log($scope.standards[0]['legislation'], $scope.standards[1]['legislation']);
                for (var i = 0; i < $scope.standards.length; i++) {
                    var found = false;
                    if ($scope.user) {
                        for (var j = 0; j < $scope.greenPoints.length; j++) {
                            if ($scope.standards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                found = true;
                                $scope.standards[i].option = $scope.greenPoints[j].option;
                                $scope.standards[i].percentage = $scope.greenPoints[j].percentage;
                                $scope.greenPoints[j].matched = true;
                                $scope.pointsEarned += $scope.greenPoints[j].option * $scope.greenPoints[j].percentage / 100.0;
                                $scope.previousPoints = $scope.greenPoints[0].option * $scope.greenPoints[0].percentage / 100.0;
                                break;
                            }
                        }
                        if (!found) {
                            $scope.standards[i].option = undefined;
                            $scope.standards[i].percentage = undefined;
                            ++countNotFound;
                        }
                    }

                }
                console.log(userService.isEmpty(shorten($routeParams.category)));
                if (userService.isEmpty($routeParams.category)) {
                    userService.saveTemp($routeParams.category, $scope.standards);
                    console.log(userService.getTemp($routeParams.category));
                }    
                else
                    loadStandards();
                initializeBar();
                if ($scope.user && $scope.standards.length - countNotFound < $scope.greenPoints.length) {
                    //delete old questions from green points
                }
                $('#DisposBar').parent().addClass('progress-category');
                $('#EnergyBar').parent().addClass('progress-category');
                $('#FoodBar').parent().addClass('progress-category');
                $('#SustaiBar').parent().addClass('progress-category');
                $('#PollutBar').parent().addClass('progress-category');
                $('#WaterBar').parent().addClass('progress-category');
                $('#WasteBar').parent().addClass('progress-category');
                //console.log($('#' + shorten($routeParams.category) + 'Bar').parent());
                $('#' + shorten($routeParams.category) + 'Bar').parent().removeClass('progress-category');
                $('#' + shorten($routeParams.category) + 'Bar').parent().addClass('progress-category-active');
                $scope.etcKeys = Object.keys($scope.etcs);
            });
        });
        
        var initializeBar = function () {
            var bar = document.getElementById(shorten($routeParams.category) + 'Bar');
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            if ($scope.pointsEarned >= $scope.minRequired)
                $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#' + shorten($routeParams.category) + 'Bar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
            if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                barjQ.html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                $('#' + shorten($routeParams.category) + 'BarAfter').html("");
            } else {
                barjQ.html("");
                $('#' + shorten($routeParams.category) + 'BarAfter').html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + '</a>');
            }
        }
     
        $scope.loginModal = function () {
            $('#loginModal').modal()
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

        $scope.computeScore = function (score, answerIndex, percent) {
            var bar = document.getElementById(shorten($routeParams.category) + 'Bar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            console.log(shorten($routeParams.category));
            if (String(Number(percent || 100)) !== "NaN") {
                userService.saveTempItem($routeParams.category, 
                                        { question: $scope.standards[$scope.index]._id, option: answerIndex, percentage: Math.min(percent || 100, 100), answered: true },
                                        $scope.index);
                $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number($scope.previousPoints);
                $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
                if ($scope.pointsEarned >= $scope.minRequired)
                    $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
                else
                    $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
                bar.setAttribute("aria-valuenow", $scope.pointsEarned);
                var barjQ = $('#' + shorten($routeParams.category) + 'Bar');
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
                if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                    barjQ.html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                    $('#' + shorten($routeParams.category) + 'BarAfter').html("");
                } else {
                    barjQ.html("");
                    $('#' + shorten($routeParams.category) + 'BarAfter').html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + '</a>');
                }
            }
        }
        
        $scope.computePercentScore = function (score, percent) {
            var bar = document.getElementById(shorten($routeParams.category) + 'Bar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            if (String(Number(percent || 100)) !== "NaN") {
                var answerIndex = userService.getTempOption($routeParams.category, 
                                        $scope.index);
                userService.saveTempItem($routeParams.category, 
                                        { question: $scope.standards[$scope.index]._id, option: answerIndex, percentage: Math.min(percent || 100, 100), answered: true },
                                        $scope.index);
                console.log(Number(score) * Number(percent || 100) / 100.0, percent || 100);
                $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number($scope.previousPoints);
                $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
                if ($scope.pointsEarned >= $scope.minRequired)
                    $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
                else
                    $('#' + shorten($routeParams.category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
                console.log($scope.pointsEarned, score);
                bar.setAttribute("aria-valuenow", $scope.pointsEarned);
                var barjQ = $('#' + shorten($routeParams.category) + 'Bar');
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
                if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                    barjQ.html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                    $('#' + shorten($routeParams.category) + 'BarAfter').html("");
                } else {
                    barjQ.html("");
                    $('#' + shorten($routeParams.category) + 'BarAfter').html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + '</a>');
                }
            }
        }

        var shorten = function (s) {
            return s.substring(0, Math.min(s.length, 6));
        }
        
        $scope.carefulMultiply = function (score, percent) {
            console.log(score, percent);
            if (!score)
                return 0;
            return Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
        }
        
        var loadStandards = function () {
            var userTempData = userService.getTemp($routeParams.category);
            for (var index in userTempData) {
                //console.log(userTempData[index].option);
                if (userTempData[index].answered) {
                    //console.log(userTempData[index].option);
                    $scope.standards[index].option = $scope.standards[index].optionList[userTempData[index].option].points;
                    $scope.standards[index].percentage = userTempData[index].percentage || 100;
                    $scope.pointsEarned += $scope.carefulMultiply($scope.standards[index].option, $scope.standards[index].percentage);
                }
            }
            $scope.previousPoints = $scope.carefulMultiply($scope.standards[0].option, $scope.standards[0].percentage);
        }

        $scope.moveLeft = function () {
            var index = $scope.index;
            if(index > 0) {
                index -= 1;
                while (!$scope.matchesFilter(index) && index >= 0) {
                    index -= 1;
                }
                if (index >= 0) {
                    $scope.index = index;
                    $scope.previousPoints = Number($scope.standards[$scope.index].option || 0) * Number($scope.standards[$scope.index].percentage || 100) / 100.0;
                }
            }
        }

        $scope.moveRight = function () {
            var index = $scope.index;
            if (index < ($scope.standards.length - 1)) {
                index += 1;
                while (!$scope.matchesFilter(index) && index <= ($scope.standards.length - 1)) {
                    index += 1;
                }
                if (index <= ($scope.standards.length - 1)) {
                    $scope.index = index;
                    $scope.previousPoints = Number($scope.standards[$scope.index].option || 0) * Number($scope.standards[$scope.index].percentage || 100) / 100.0;;
                }
            }
        }
    
        $scope.matchesFilter = function(index) {
            var valid = false;
            if ($scope.obj && $scope.standards[index].filters) {
                if ($scope.obj.easy) {
                    valid = $scope.standards[index].filters.indexOf("Easy") >= 0;
                }
                if ($scope.obj.lowcost && !valid) {
                    valid = $scope.standards[index].filters.indexOf("Low Cost") >= 0;
                }
                if ($scope.obj.visible && !valid) {
                    valid = $scope.standards[index].filters.indexOf("Visible") >= 0;
                }
            } else {
                return true;
            }
            return valid;
        }
        
        $scope.filterModal = function (close) {
            if (close)
                $('#filterModal').modal('hide');
            else
                $('#filterModal').modal();
        }
        
        $scope.tutorialModal = function (close) {
            if (close)
                $('#tutorialModal').modal('hide');
            else
                $('#tutorialModal').modal();
        }

        $scope.save = function () {
            if ($scope.user) {
                for (var i = 0; i < $scope.standards.length; i++) {
                    if ($scope.standards[i].option) {
                        $scope.standards[i].percentage = $scope.standards[i].percentage ? $scope.standards[i].percentage : 100;
                        console.log($scope.standards[i]._id, parseFloat($scope.standards[i].option), $scope.standards[i].percentage);
                        $http.put('/api/standards', { standardId : $scope.standards[i]._id, selectedOption : parseFloat($scope.standards[i].option), percentage : $scope.standards[i].percentage })
                        .then(function (response) { });
                    }
                }
                //$window.location.href = '/#/';
                alert("Selections been saved!")
            } else {
                $scope.loginModal();
            }
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
        
        $scope.logout = function () {
            $http.get("/logout").success(function (data) {
                $window.location.href = '/#'
            }).error(function (err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
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
                }).error(function (err) {
                    $scope.logInErrorMessage = "Login unsuccessful. Try again.";
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
                $scope.logInErrorMessage = "Username must be an email";
                $scope.showLogInErrorMessage = true;
            } else {
                if (confpassword === password) {
                    $http.post("/client/index", { username: username, password: password }).success(function (data) {
                        $scope.usernamesignup = "";
                        $scope.passwordsignup = "";
                        $scope.confirmpassword = "";
                        $('#signUpModal').modal('hide');
                        $window.location.href = "/list/#/profile";
                    }).error(function (err) {
                        $scope.message = "Registration unsuccessful. Try again.";
                        $scope.showSignUpErrorMessage = true;
                        $scope.showErrorMessage = true;
                    });
                } else {
                    $scope.logInErrorMessage = "Password and confirmation password do not match. Try again.";
                    $scope.showLogInErrorMessage = true;
                }                ;
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

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };

        activate();

        function activate() { }
    }
})();
