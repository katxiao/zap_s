(function () {
    'use strict';

    angular.module('tutorial', []).service('tutorialService', function () {
        
        var inTutorial = false;
        
        this.startTutorial = function () {
            inTutorial = true;
        }
        
        this.endTutorial = function () {
            inTutorial = false;
        }
        
        this.getTutorialState = function () {
            return inTutorial;
        }
    });
})();