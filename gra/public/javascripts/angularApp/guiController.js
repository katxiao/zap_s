//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('guiController', guiController);

    guiController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll', '$routeParams'];

    function guiController($scope, $http, $cookies, $window, $location, $anchorScroll, $routeParams) {
        $scope.title = 'guiController';
        
        $scope.pointsEarned = 0;
        $scope.minRequired = 10;
        $scope.progressstatus = 'danger';

        console.log($scope.minRequired);

        $scope.index = 0;
        $scope.previousPoints = 0;

        $http.get('/api/standards/Energy').success(function (data) {
            $scope.standards = data;
            $scope.maxPossible = $scope.computeMaxPossible($scope.standards);
            console.log($scope.maxPossible);
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
                $scope.progressstatus = 'success';
            else
                $scope.progressstatus = 'danger';
            console.log($scope.pointsEarned, score);
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
                $window.location.href = '/#/login'
            }).error(function(err) {
                $scope.message = "Logout unsuccessful. Try again.";
                $scope.showErrorMessage = true;
            })
        }

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();
