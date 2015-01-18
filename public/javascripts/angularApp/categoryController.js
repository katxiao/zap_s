//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('guiApp')
        .controller('categoryController', categoryController);

    categoryController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll', '$routeParams'];

    function categoryController($scope, $http, $cookies, $window, $location, $anchorScroll, $routeParams) {
        $scope.title = 'guiController';

        $scope.pointsEarned = 0;
        $scope.minRequired = 10;
        $scope.progressstatus = 'danger';

        var countNotFound = 0;

        $scope.index = 0;
        $scope.previousPoints = 0;

        $http.get('/current_auth').success(function (data) {
            $scope.user = data.content.user;
            if ($scope.user) 
                $scope.greenPoints = $scope.user.GPs;
            $http.get('/api/standards/' + $routeParams.category).success(function (data) {
                $scope.standards = data;
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
                if ($scope.user && $scope.standards.length - countNotFound < $scope.greenPoints.length) {

                }
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
            $scope.pointsEarned -= $scope.previousPoints;
            $scope.pointsEarned += Number(score);
            $scope.previousPoints = Number(score);
            if ($scope.pointsEarned >= $scope.minRequired)
                $('#' + $routeParams.category).removeClass('progress-bar-danger').addClass('progress-bar-success');
            else
                $('#' + $routeParams.category).removeClass('progress-bar-success').addClass('progress-bar-danger');
            console.log($scope.pointsEarned, score);
            var bar = $('#' + $routeParams.category);
            bar.width(Math.min($scope.pointsEarned * 100.0 / $scope.minRequired, 100) + "%");
            if ($scope.pointsEarned * 100.0 / $scope.minRequired > 50) {
                bar.html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + ' (' + $scope.pointsEarned + '/' + $scope.minRequired + ')</a>');
                $('#' + $routeParams.category + 'After').html("");
            } else {
                bar.html("");
                $('#' + $routeParams.category + 'After').html('<a href="/gui/#/' + $routeParams.category + '">' + $routeParams.category + '</a>');
            }
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
