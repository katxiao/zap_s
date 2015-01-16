//Author: Jamar Brooks
(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('homeController', homeController);

    homeController.$inject = ['$scope', '$http', '$cookies', '$window', '$location', '$anchorScroll'];

    function homeController($scope, $http, $cookies, $window, $location, $anchorScroll) {
        $scope.title = 'homeController';
        $scope.user = undefined;
        
        $scope.pointsEarned = 0;
        $scope.minRequired = 80;

        $http.get('/current_auth').success(function(data) {
            $scope.user = data.content.user;
            if ($scope.user) $scope.greenPoints = $scope.user.GPs;
            $http.get('/api/standards/Energy').success(function (data) {
                $scope.standards = data;
                for (var i = 0; i < $scope.standards.length; i++) {
                    var found = false;
                    if ($scope.user) {
                        for (var j = 0; j < $scope.greenPoints.length; j++) {
                            if ($scope.standards[i]._id.toString() === $scope.greenPoints[j].question.toString()) {
                                found = true;
                                $scope.standards[i].option = $scope.greenPoints[j].option;
                                $scope.standards[i].percentage = $scope.greenPoints[j].percentage;
                            }
                        }
                        if (!found) {
                            $scope.standards[i].option = undefined;
                            $scope.standards[i].percentage = undefined;
                        }
                    }
                }
            });
        });

        $scope.save = function() {
            for (var i = 0; i < $scope.standards.length; i++) {
                if ($scope.standards[i].option) {
                    $scope.standards[i].percentage = $scope.standards[i].percentage ? $scope.standards[i].percentage : 100;
                    $http.put('/api/standards', {standardId : $scope.standards[i]._id, selectedOption : parseInt($scope.standards[i].option), percentage : $scope.standards[i].percentage})
                    .then(function(response){});
                }
            }
        }

        $scope.goToGUI = function() {
            $window.location.href = '/gui/#/';
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
