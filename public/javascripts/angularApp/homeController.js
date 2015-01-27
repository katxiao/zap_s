//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('homeController', homeController);

    homeController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll', '$routeParams', 'tutorialService'];

    function homeController($scope, $http, $cookies, $window, $location, $anchorScroll, $routeParams, tutorialService) {
        $scope.title = 'homeController';
        $scope.user = undefined;
        $scope.logInErrorMessage = '';
        $scope.showLogInErrorMessage = false;
        $scope.showForgotPasswordMessage = false;
        $scope.showProgressError = false;
        console.log($cookies.tutorial);
        $scope.pointsEarned = 0;

        $scope.twoStar = 100;
        $scope.threeStar = 175;
        $scope.fourStar = 240;

        $scope.standardsByCategory = {};
        $scope.categoryKeys = [];
        $scope.widths = {};
        
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
        
        $scope.continueTutorial = function (){
            $window.location.href = '/gui/#/Disposables';
        }
        
        $scope.endTutorial = function () {
            $cookies.tutorial = 'false';
            $('#tutorialModal').modal('hide');
        }

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
                                $scope.standards[i].previousPoints = $scope.greenPoints[j].option * $scope.greenPoints[j].percentage / 100.0;
                                break;
                            }
                        }
                        if (!found) {
                            $scope.standards[i].option = undefined;
                            $scope.standards[i].percentage = undefined;
                        }
                    }
                    if ($scope.standardsByCategory[$scope.standards[i].category]) {
                        $scope.standards[i].index = $scope.standardsByCategory[$scope.standards[i].category].questions.length;
                        $scope.standardsByCategory[$scope.standards[i].category].questions.push($scope.standards[i]);
                        $scope.standardsByCategory[$scope.standards[i].category].value += $scope.standards[i].previousPoints;
                    } else {
                        $scope.standards[i].index = 0;
                        $scope.standardsByCategory[$scope.standards[i].category] = { value: $scope.standards[i].previousPoints, questions: [ $scope.standards[i]] };
                        $scope.categoryKeys.push($scope.standards[i].category);
                    }
                }
                initializeBar();
                $scope.etcKeys = Object.keys($scope.etcs);
            }).then(function () {
                for (var index in $scope.standardsByCategory) {
                    var points = 0;
                    for (var i in $scope.standardsByCategory[index].questions) {
                        points += Number($scope.standardsByCategory[index].questions[i].option || 0) * Number($scope.standardsByCategory[index].questions[i].percentage || 0) / 100.0;
                    }
                    $scope.widths[index] = { valuenow: points, width: Math.min(points * 100.0 / 10.0, 100) + "%", message: index + ' (' + points + '/' + 10 + ')' };
                    if (points > 10) {
                        $scope.widths[index].class = 'progress-bar-success';
                    } else {
                        $scope.widths[index].class = 'progress-bar-danger';
                    }
                }
                console.log($cookies.tutorial);
                if ($cookies.tutorial==='true') {
                    console.log("tutorial ongoing");
                    $('#tutorialModal').modal();
                }
            });
        });
        
        var allMeetMinRequirement = function () {
            for (var key in $scope.standardsByCategory) {
                if (key !== 'Sustainable Furnishings & Building Materials' && $scope.standardsByCategory[key].value < 10) {
                    console.log(key, $scope.standardsByCategory[key].value);
                    return false;
                }
            }
            return true;
        }

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
            console.log(allMeetMinRequirement());
            if ($scope.pointsEarned >= $scope.fourStar) {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **4-Star**');
                    $scope.statusImage = "/images/cgr4starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **4-Star eligible**');
                    $scope.statusImage = "";
                }
            }    
            else if ($scope.pointsEarned >= $scope.threeStar) {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **3-Star**');
                    $scope.statusImage = "/images/cgr3starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **3-Star eligible**');
                    $scope.statusImage = "";
                }
            }    
            else if ($scope.pointsEarned >= $scope.twoStar) {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.threeStar, 100) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html($scope.pointsEarned + '/' + $scope.threeStar + ' points **2-Star**');
                    $scope.statusImage = "/images/cgr2starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }    
            else {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.twoStar, 100) + "%");
                barjQ.html($scope.pointsEarned + '/' + $scope.twoStar + ' points');
                $scope.statusImage = "";
            }
        }

        
        $scope.computeScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            var bar = document.getElementById('TotalBar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            $scope.standardsByCategory[category].questions[answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            console.log(Number(score), (Number(percent || 100) / 100.0), Number(score) * (Number(percent || 100) / 100.0));
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

            var catbar = document.getElementById(category + 'Bar');
            var catPE = catbar.getAttribute("aria-valuenow");
            var minRequired = catbar.getAttribute("aria-valuemax");
            catPE = Number(catPE) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            if (catPE >= minRequired)
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            catbar.setAttribute("aria-valuenow", catPE);
            $scope.standardsByCategory[category].value = catPE;
            var catbarjQ = $('#' + shorten(category) + 'Bar');
            catbarjQ.width(Math.min(catPE * 100.0 / minRequired, 100) + "%");
            //if (catPE * 100.0 / minRequired > 50) {
            catbarjQ.html('<span>' + category + ' (' + catPE + '/' + minRequired + ')</span>');
            /*    //$('#' + shorten(category) + 'BarAfter').html("");
            } else {
                catbarjQ.html("");
                //$('#' + shorten(category) + 'BarAfter').html('<a href="/gui/#/' + category + '">' + category + '</a>');
            }*/
            
            var barjQ = $('#TotalBar');
            if ($scope.pointsEarned >= $scope.fourStar) {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **4-Star eligible**');
                    $scope.statusImage = "/images/cgr4starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }
            else if ($scope.pointsEarned >= $scope.threeStar) {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.fourStar) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **3-Star eligible**');
                    $scope.statusImage = "/images/cgr3starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }
            else if ($scope.pointsEarned >= $scope.twoStar) {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.threeStar) + "%");
                console.log(allMeetMinRequirement());
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.threeStar + ') **2-Star eligible**');
                    $scope.statusImage = "/images/cgr2starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.threeStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }    
            else {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.twoStar) + "%");
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.twoStar + ')');
                $scope.statusImage = "";
            }
        }
        
        $scope.computePercentScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            var bar = document.getElementById('TotalBar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            $scope.standardsByCategory[category].questions[answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
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
            if ($scope.pointsEarned >= $scope.fourStar) {
                barjQ.width(Math.min($scope.pointsEarned * 100.0 / $scope.fourStar, 100) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **4-Star eligible**');
                    $scope.statusImage = "/images/cgr4starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }
            else if ($scope.pointsEarned >= $scope.threeStar) {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.fourStar) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.fourStar + ') **3-Star eligible**');
                    $scope.statusImage = "/images/cgr3starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.fourStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }
            else if ($scope.pointsEarned >= $scope.twoStar) {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.threeStar) + "%");
                if (allMeetMinRequirement()) {
                    barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.threeStar + ') **2-Star eligible**');
                    $scope.statusImage = "/images/cgr2starsmall.jpg";
                } else {
                    barjQ.html($scope.pointsEarned + '/' + $scope.threeStar + ' points **2-Star eligible**');
                    $scope.statusImage = "";
                }
            }    
            else {
                barjQ.width(($scope.pointsEarned * 100.0 / $scope.twoStar) + "%");
                barjQ.html('Total (' + $scope.pointsEarned + '/' + $scope.twoStar + ')');
                $scope.statusImage = "";
            }

            var catbar = document.getElementById(category + 'Bar');
            var catPE = catbar.getAttribute("aria-valuenow");
            var minRequired = catbar.getAttribute("aria-valuemax");
            catPE = Number(catPE) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            if (catPE >= minRequired)
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            catbar.setAttribute("aria-valuenow", catPE);
            var catbarjQ = $('#' + shorten(category) + 'Bar');
            catbarjQ.width(Math.min(catPE * 100.0 / minRequired, 100) + "%");
            catbarjQ.html('<span>' + category + ' (' + catPE + '/' + minRequired + ')</span>');
        }
        
        var shorten = function (s) {
            return s.substring(0, Math.min(s.length, 6));
        }
        
        $scope.carefulMultiply = function (score, percent) {
            if (!score)
                return 0;
            return Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
        }

        $scope.goToGUI = function() {
            $window.location.href = '/gui/#/';
        }
        
        $scope.extraInfoModal = function (category, index) {
            $scope.modalStandard = $scope.standardsByCategory[category].questions[index];
            $('#extraInfoModal').modal();
        }
        
        $scope.filterModal = function (){
            console.log("filter modal");
            $('#filterInfoModal').modal();
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
                $scope.showProgressError = true;
                $scope.progressError = "Selections have been saved.";
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
            //$scope.categoryKeys = Object.keys($scope.standardsByCategory);
            //$scope.totalPoints = 0;
            //for (var key in $scope.standardsByCategory) {
            //    $scope.standardsByCategory[key].value = 0;
            //    for (var index in $scope.standardsByCategory[key].questions) {
            //        $scope.standardsByCategory[key].value += $scope.pointsByCategory[key].questions[index].value;
            //        $scope.totalPoints += $scope.standardsByCategory[key].questions[index].value;
            //    }
            //}
            $('#progressModal').modal();
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
                            $window.location.href = "/list/#/profile";
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
        // activate();

        // function activate() { }
    }
})();
