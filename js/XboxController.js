
'use strict';

var XboxController = function () {
	this.gamepad = navigator.getGamepads()[0];
	this.connected = !!this.gamepad;
	console.log(this.gamepad);
};

XboxController.prototype.poll = function() {
	if (this.gamepad) {
		
	}
};