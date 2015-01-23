(function () {
    'use strict';

    angular
        .module('guiApp')
        .controller('itemController', itemController);

    itemController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$routeParams', 'userService'];

    function itemController($scope, $http, $cookies, $window, $location, $routeParams, userService) {
        //$scope.modalInit = 'hide';

        $scope.pointsEarned = 0;
        $scope.minRequired = 10;
        $scope.progressstatus = 'danger';

        var countNotFound = 0;

        $scope.index = 0;
        $scope.previousPoints = 0;

        $scope.etcs = {
            legislation: {
                header: 'Legislation',
                open: false
            },
            ecofacts: {
                header: 'EcoFacts',
                open: false
            },
            rebateincentives: {
                header: 'Rebates/Incentives', 
                open: false
            },
            solutions: {
                header: 'Product Solutions',
                open: false
            }
        }

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            if ($scope.user) {
                $scope.admin = $scope.user.admin;
                $scope.greenPoints = $scope.user.GPs;
            }
            $http.get('/api/standards/' + $routeParams.room + '/' + $routeParams.item).success(function (data) {
                console.log('DATA', data);
                $scope.standards = data.content ? data.content.standards : [];
                $scope.maxPossible = $scope.computeMaxPossible($scope.standards);
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
                            ++countNotFound;
                        }
                    }
                }
                // TODO: do not do this
                // Initalize ALL category bars on load
                // For each answered question, add points to the appropriate category in userService
                var category = $scope.standards.length > 0 ? $scope.standards[1].category : "Energy";
                initializeBar(category);
                userService.saveTemp(shorten(category), $scope.standards);
                if (userService.isEmpty(category)) {
                    userService.saveTemp(category, $scope.standards);
                }    
                else {
                    loadStandards(category);
                }
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
                $('#' + shorten(category) + 'Bar').parent().removeClass('progress-category');
                $('#' + shorten(category) + 'Bar').parent().addClass('progress-category-active');
                $scope.etcKeys = Object.keys($scope.etcs);
            });
        });
        var loadStandards = function (category) {
            var userTempData = userService.getTemp(category);
            for (var index in userTempData) {
                //console.log(userTempData[index].option);
                if (userTempData[index].answered) {
                    //console.log(userTempData[index].option);
                    $scope.standards[index].option = $scope.standards[index].optionList[userTempData[index].option].points;
                    $scope.standards[index].percentage = userTempData[index].percentage || 100;
                }
            }
        }

        var initializeBar = function (category) {
            console.log(category)
            var bar = document.getElementById(shorten(category) + 'Bar');
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            if ($scope.pointsEarned >= $scope.minRequired)
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#' + shorten(category) + 'Bar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
            if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                barjQ.html('<a href="/gui/#/' + $routeParams.category + '">' + category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                $('#' + shorten(category) + 'BarAfter').html("");
            } else {
                barjQ.html("");
                $('#' + shorten(category) + 'BarAfter').html('<a href="/gui/#/' + category + '">' + category + '</a>');
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

        $scope.computeScore = function(score, category)
        {
            var bar = document.getElementById(shorten(category) + 'Bar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            console.log($scope.pointsEarned, $scope.minRequired);
            $scope.pointsEarned -= $scope.previousPoints;
            $scope.pointsEarned += Number(score);
            $scope.previousPoints = Number(score);
            if ($scope.pointsEarned >= $scope.minRequired)
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            console.log($scope.pointsEarned, score);
            bar.setAttribute("aria-valuenow", $scope.pointsEarned);
            var barjQ = $('#' + shorten(category) + 'Bar');
            barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
            if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                barjQ.html('<a href="/gui/#/' + category + '">' + category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                $('#' + shorten(category) + 'BarAfter').html("");
            } else {
                barjQ.html("");
                $('#' + shorten(category) + 'BarAfter').html('<a href="/gui/#/' + category + '">' + category + '</a>');
            }
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

        $scope.log = function () { console.log('time');}

        $scope.etcs = {
            Legislation: {
                header: 'Legislation',
                content: 'Laws and stuff',
                open: true
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
                $window.location.href = '/#/login'
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
