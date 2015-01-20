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
        
        console.log(userService.user());

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            $scope.admin = $scope.user.admin;
            console.log('user',$scope.user);
            if ($scope.user) 
                $scope.greenPoints = $scope.user.GPs;
            $http.get('/api/standards/item?room=' + $routeParams.room + '&item=' + $routeParams.item).success(function (data) {
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
                // userService.saveTemp(shorten($routeParams.category), $scope.standards);
                // if ($scope.user && $scope.standards.length - countNotFound < $scope.greenPoints.length) {
                //     //delete old questions from green points
                // }
            });
        });

        $scope.login = function() {
            $window.location.href = "/#/login";
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

        $scope.computeScore = function(score)
        {
            var bar = document.getElementById(shorten($routeParams.category) + 'Bar');
            $scope.pointsEarned = bar.getAttribute("aria-valuenow");
            $scope.minRequired = bar.getAttribute("aria-valuemax");
            console.log($scope.pointsEarned, $scope.minRequired);
            $scope.pointsEarned -= $scope.previousPoints;
            $scope.pointsEarned += Number(score);
            $scope.previousPoints = Number(score);
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

        $scope.logout = function () {
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
        };

        activate();

        function activate() { }
    }
})();