//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('tutorialController', tutorialController);

    tutorialController.$inject = ['$scope', '$http', '$cookies','$cookieStore', '$window', '$location', '$anchorScroll', '$routeParams', 'tutorialService'];

    function tutorialController($scope, $http, $cookies, $cookieStore, $window, $location, $anchorScroll, $routeParams, tutorialService) {
        $scope.title = 'homeController';
        $scope.user = undefined;
        $scope.logInErrorMessage = '';
        $scope.showLogInErrorMessage = false;
        $scope.showForgotPasswordMessage = false;
        $scope.showProgressError = false;
        
        $scope.pointsEarned = 0;

        $scope.twoStar = 100;
        $scope.threeStar = 175;
        $scope.fourStar = 240;
        $scope.stars = 0;

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
            $cookieStore.put('tutorial', 'nogo');
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
                        $scope.standardsByCategory[$scope.standards[i].category].value = $scope.standardsByCategory[$scope.standards[i].category].value + $scope.standards[i].previousPoints;
                    } else {
                        $scope.standards[i].index = 0;
                        $scope.standardsByCategory[$scope.standards[i].category] = { value: $scope.standards[i].previousPoints, questions: [ $scope.standards[i]] };
                        $scope.categoryKeys.push($scope.standards[i].category);
                        $scope.standardsByCategory[$scope.standards[i].category].value = $scope.standardsByCategory[$scope.standards[i].category].value;
                    }
                }
                //initializeBar();
                initializeTotalButton();
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
                console.log($cookieStore.get('tutorial'));
                console.log("tutorial ongoing");
                $('#tutorialModal').modal();
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

        var initializeTotalButton = function() {
            var meetsMinReq = true;
            for (var i = 0; i < $scope.categoryKeys.length; i++) {
                meetsMinReq = meetsMinReq && ($scope.standardsByCategory[$scope.categoryKeys[i]].value >= 10);
            }
            console.log('meetsMinReq', meetsMinReq);
            if (meetsMinReq) {
                if ($scope.pointsEarned >= $scope.twoStar && $scope.pointsEarned < $scope.threeStar) {
                    $scope.stars = 2;
                }
                else if ($scope.pointsEarned >= $scope.threeStar && $scope.pointsEarned < $scope.fourStar) {
                    $scope.stars = 3;
                }
                else if ($scope.pointsEarned >= $scope.fourStar) {
                    $scope.stars = 4;
                }
            } else {
                $scope.stars = 0;
            }
            console.log('stars',$scope.stars);
        }

        var initializeButton = function(category) {
            var catButton = $("button[id='"+ category + "Button']");
            console.log(catButton);
            console.log('initializing category', category);
            if ($scope.standardsByCategory[category].value >= 10) {
                console.log("adding success class")
                catButton.removeClass('cat-button-danger').addClass('cat-button-success');
            } else {
                console.log("adding danger class")
                catButton.removeClass('cat-button-success').addClass('cat-button-danger');
            }
        }

        
        $scope.computeScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            $scope.standardsByCategory[category].questions[answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            console.log(Number(score), (Number(percent || 100) / 100.0), Number(score) * (Number(percent || 100) / 100.0));
            $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            console.log($scope.standardsByCategory[category].value)
            console.log($scope.standardsByCategory[category].questions[answerIndex].previousPoints);
            $scope.standardsByCategory[category].value = Number($scope.standardsByCategory[category].value) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            if ($scope.pointsEarned >= $scope.fourStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-success').addClass('progress-bar-info');
            else if ($scope.pointsEarned >= $scope.threeStar)
                $('#TotalBar').removeClass('progress-bar-info').removeClass('progress-bar-danger').removeClass('progress-bar-success').addClass('progress-bar-primary');
            else if ($scope.pointsEarned >= $scope.twoStar)
                $('#TotalBar').removeClass('progress-bar-danger').removeClass('progress-bar-primary').removeClass('progress-bar-info').addClass('progress-bar-success');
            else
                $('#TotalBar').removeClass('progress-bar-success').addClass('progress-bar-danger');

            var catbar = document.getElementById($scope.shorten(category) + 'Bar');
            var catPE = catbar.getAttribute("aria-valuenow");
            var minRequired = catbar.getAttribute("aria-valuemax");
            catPE = Number(catPE) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
            if (catPE >= minRequired)
                $('#' + $scope.shorten(category) + 'Bar').removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + $scope.shorten(category) + 'Bar').removeClass('progress-bar-success').addClass('progress-bar-danger');
            catbar.setAttribute("aria-valuenow", catPE);
            $scope.standardsByCategory[category].value = catPE;
            var catbarjQ = $('#' + $scope.shorten(category) + 'Bar');
            catbarjQ.width(Math.min(catPE * 100.0 / minRequired, 100) + "%");
            catbarjQ.html('<span>' + category + ' (' + catPE + '/' + minRequired + ')</span>');
            initializeButton(category);
            initializeTotalButton();
        }
        
        $scope.computePercentScore = function (category, score, answerIndex, percent, previousPoints) {
            console.log(category, score, answerIndex, percent, previousPoints);
            if (answerIndex) {
                $scope.standardsByCategory[category].questions[answerIndex].previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
                $scope.previousPoints = Number(score) * Math.min(Number(percent || 100), 100) / 100.0;
                $scope.pointsEarned = Number($scope.pointsEarned) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
                $scope.standardsByCategory[category].value = Number($scope.standardsByCategory[category].value) + Number(score) * Math.min(Number(percent || 100), 100) / 100.0 - Number(previousPoints);
            }
            initializeButton(category);
            initializeTotalButton();
        }
        
        $scope.shorten = function (s) {
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
        
        $scope.extraInfoModal = function (category, index, key) {
            $scope.modalStandard = $scope.standardsByCategory[category].questions[index];
            $scope.etc = key;
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
                alert("Selections been saved!")
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

        $scope.certificationReqsModal = function() {
            $('#signUpModal').modal('hide');
            $('#progressModal').modal('hide');
            $('#loginModal').modal('hide');
            //Todo: close all other modals
            $('#certificationReqsModal').modal();
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
        
        $scope.percentModal = function (standard, points) {
            if (standard.option !== 0) {
                $scope.currentStandard = standard;
                $scope.currentOptionPoints = points;
                $('#percentModal').modal();
            } else {
                $scope.computeScore(standard.category, points, standard.index, standard.percentage, standard.previousPoints);
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
                        $http.post('/login', { username: username, password: password }).success(function (data) {
                            $scope.user = data.content.user;
                            for (var i = 0; i < $scope.standards.length; i++) {
                                if ($scope.standards[i].option) {
                                    $scope.standards[i].percentage = $scope.standards[i].percentage ? $scope.standards[i].percentage : 100;
                                    $http.put('/api/standards', { standardId: $scope.standards[i]._id, selectedOption: parseFloat($scope.standards[i].option), percentage: $scope.standards[i].percentage })
                                    .then(function (response) { });
                                }
                            }
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
    }
})();
