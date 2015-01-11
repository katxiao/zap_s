//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('guiController', guiController);

    guiController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function guiController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'guiController';
        
        $scope.pointsEarned = 0;
        $scope.minRequired = 8;

        $scope.index = 0;
        $scope.previousPoints = 0;

        $http.get('/api/standards/Energy').success(function (data) {
            $scope.standards = data;
        });

        $scope.login = function() {
            $window.location.href = "/#/login";
        }

        $scope.computeScore = function(score)
        {
            $scope.pointsEarned -= $scope.previousPoints;
            $scope.pointsEarned += Number(score);
            $scope.previousPoints = Number(score);
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

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        activate();

        function activate() { }
    }
})();
