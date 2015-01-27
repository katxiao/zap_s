(function () {
    'use strict';

    angular
        .module('guiApp')
        .controller('itemController', itemController);

    itemController.$inject = ['$scope', '$http', '$cookieStore', '$window', '$location', '$routeParams', 'userService'];

    function itemController($scope, $http, $cookieStore, $window, $location, $routeParams, userService) {
        //$scope.modalInit = 'hide';
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
        
        $scope.endTutorial = function () {
            $cookieStore.put('tutorial', 'done');
            $('#itemTutorialModal').modal('hide');
        }
        
        $scope.tour = function () {
            $cookieStore.put('tutorial', 'done');
            $('#itemTutorialModal').modal('hide');
        }

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            if ($scope.user) {
                $scope.admin = $scope.user.admin;
                $scope.greenPoints = $scope.user.GPs;
                initializeAllBars();
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

                // var category = $scope.standards.length > 0 ? $scope.standards[1].category : "Energy";
                // initializeBar();
                // userService.saveTemp(shorten(category), $scope.standards);
                // if (userService.isEmpty(category)) {
                //     userService.saveTemp(category, $scope.standards);
                // }    
                // else {
                //     loadStandards(category);
                // }
                // if ($scope.user && $scope.standards.length - countNotFound < $scope.greenPoints.length) {
                //     //delete old questions from green points
                // }
                $('#DisposBar').parent().addClass('progress-category');
                $('#EnergyBar').parent().addClass('progress-category');
                $('#FoodBar').parent().addClass('progress-category');
                $('#SustaiBar').parent().addClass('progress-category');
                $('#PollutBar').parent().addClass('progress-category');
                $('#WaterBar').parent().addClass('progress-category');
                $('#WasteBar').parent().addClass('progress-category');
                //$('#' + shorten(category) + 'Bar').parent().removeClass('progress-category');
                //$('#' + shorten(category) + 'Bar').parent().addClass('progress-category-active');
                $scope.etcKeys = Object.keys($scope.etcs);
                if ($cookieStore.get('tutorial') === 'ongoing') {
                    $('#itemTutorialModal').modal();
                }
            });
        });
    
        var initializeAllBars = function() {
            var catNames = userService.getCatNames();
            for (var i = 0; i < catNames.length; i++) {
                var tempCategory = catNames[i];
                console.log('initializing', catNames[i], tempCategory);
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
                        console.log('category', catStandards[0].category);
                        initializeBar(catStandards[0].category, catPointsEarned);
                    }
                });
            }
        }


        $scope.carefulMultiply = function (score, percent) {
            console.log(score, percent);
            if (!score)
                return 0;
            return Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
        }

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
            var category = $scope.standards[$scope.index].category
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
            var index = $scope.index;
            if (index > 0) {
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
        
        $scope.matchesFilter = function (index) {
            var valid = false;
            if ($scope.obj && $scope.standards[index].filters) {
                if (!$scope.obj.easy && !$scope.obj.lowcost && !$scope.obj.visible)
                    return true;
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
        
        $scope.filterModal = function () {
            console.log("filter modal");
            $('#filterInfoModal').modal();
        }

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
