(function () {
    'use strict';

    angular
        .module('app.message')
        .directive('wlfgMessageHeightList', wlfgMessageHeightList)
    ;

    wlfgMessageHeightList.$inject = ["$window", "$timeout"];
    function wlfgMessageHeightList($window, $timeout) {
        var directive = {
            link: link,
            restrict: 'A',
        };
        return directive;

        function link(scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };

            /* UGLY HACK */
            $timeout(function() {
                element.css('height', w.height() - 213 + 'px');
            }, 250);

            $timeout(function() {
                element.css('height', w.height() - 213 + 'px');
            }, 500);

            $timeout(function() {
                element.css('height', w.height() - 213 + 'px');
            }, 750);

            $timeout(function() {
                element.css('height', w.height() - 213 + 'px');
            }, 1000);

            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.style = function () {
                    return { 
                        'height': (newValue.h - 213) + 'px',
                    };
                };
                
            }, true);
        
            w.bind('resize', function () {
                scope.$apply();
            });
        }
    }

})();