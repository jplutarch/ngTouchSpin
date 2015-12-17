angular.module('jkuri.touchspin', [])

.directive('ngTouchSpin', ['$timeout', '$interval', '$document', function($timeout, $interval, $document) {
	'use strict';

	var key_codes = {
        tab   : 9, 
		left  : 37,
        up    : 38,
        right : 39,
        down  : 40
	};

	var setScopeValues = function (scope, attrs) {
        scope.min = parseFloat(attrs.min) || 0;
        scope.max = parseFloat(attrs.max) || 100;
        scope.step = parseFloat(attrs.step) || 1;
		scope.prefix = attrs.prefix || undefined;
		scope.postfix = attrs.postfix || undefined;
		scope.decimals = attrs.decimals || 0;
		scope.stepInterval = attrs.stepInterval || 100;
		scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
		scope.initval = attrs.initval || '';
		scope.val = attrs.value || scope.initval;
        scope.verticalButtons = attrs.verticalButtons === "true" || false;
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: true,
		replace: true,
		link: function (scope, element, attrs, ngModel) {
			setScopeValues(scope, attrs);

			var $body = $document.find('body');
            var timeout, timer, oldval = scope.val, clickStart;

			ngModel.$setViewValue(scope.val);
			scope.focused = false;

			scope.decrement = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

				if (value < scope.min) {
					value = parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = value;
					ngModel.$setViewValue(value);
					return;
				}

				scope.val = value;
				ngModel.$setViewValue(value);
			};

			scope.increment = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

				if (value > scope.max) return;

				scope.val = value;
				ngModel.$setViewValue(value);
			};

			scope.startSpinUp = function () {
				scope.checkValue();
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				$timeout(function() {
					timer = $interval(function() {
						scope.increment();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.startSpinDown = function () {
				scope.checkValue();
				scope.decrement();

				clickStart = Date.now();

				var timeout = $timeout(function() {
					timer = $interval(function() {
						scope.decrement();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
				if (Date.now() - clickStart > scope.stepIntervalDelay) {
					$timeout.cancel(timeout);
					$interval.cancel(timer);
				} else {
					$timeout(function() {
						$timeout.cancel(timeout);
						$interval.cancel(timer);
					}, scope.stepIntervalDelay);
				}
			};

			scope.checkValue = function () {
				var val;

				if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
					val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = val;
					ngModel.$setViewValue(val);
				}

				scope.focused = false;
			};

			scope.focus = function () {
				scope.focused = true;
			};

			ngModel.$render = function () {
				scope.val = ngModel.$viewValue;
			};

			$body.bind('keydown', function(event) {
                var which = event.which;

                if (!scope.focused || which === key_codes.tab) {
					return;
				}

				event.preventDefault();

                if (which === key_codes.right || which === key_codes.up) {
					scope.increment();
                } else if (which === key_codes.left || which === key_codes.down) {
					scope.decrement();
				}

				scope.$apply();
			});
		},
		template: 
        '<div class="input-group ng-touchspin">' +
		'  <span class="input-group-btn" ng-show="!verticalButtons">' +
		'    <button class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
		'  </span>' +
		'  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <input type="text" ng-model="val" class="form-control" ng-blur="checkValue()" ng-focus="focus()">' +
		'  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		'  <span class="input-group-btn" ng-show="!verticalButtons">' +
		'    <button class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
		'  </span>' +
        '  <span class="input-group-btn-vertical" ng-hide="!verticalButtons">' +
        '    <button class="btn btn-default ng-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="fa fa-plus"></i></button>' +
        '    <button class="btn btn-default ng-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="fa fa-minus"></i></button>' +
        '  </span>' +
		'</div>'
	};
}]);