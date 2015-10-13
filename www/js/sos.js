var updateInt, flashingInt, startflashInt, progressInt;
var startUpdate = 1;
var $sos__button = $('.button__sos');
var progressUtils = {
	startProgress: function() {
		$sos__button.addClass('_pressed');
		progressInt = setInterval(progressUtils.incrementProgress, 30);
	},
	incrementProgress: function() {
		if (startUpdate >= 100) {
			clearInterval(updateInt);
			clearInterval(progressInt);
			$sos__button.addClass('_flashing _pressed').attr('data-progress', 100);
			if (window.localStorage.sos__flash === 'true') flashUtils.start();
			smsUtils.send();
		}
		ionic.requestAnimationFrame(progressUtils.update());
	},
	update: function() {
		$sos__button.attr('data-progress', startUpdate);
		startUpdate += 1;		
	},
	clearAll: function() {
		startUpdate = 0;
		$sos__button.removeClass('_flashing _pressed').attr('data-progress', 0);
		clearTimeout(startflashInt);
		clearInterval(updateInt);
		clearInterval(flashingInt);
		clearInterval(progressInt);
		window.plugins.flashlight.switchOff();
	}
};
var buttonUtils = {
	releaseButton: function() {
		if ($sos__button.attr('data-progress') != 100) progressUtils.clearAll();
	}
};
var smsUtils = {
	send: function() {
		if (window.localStorage.sos__gps === 'true') {
			var smsMessage = helpers.translit(window.localStorage.sos__message) + window.localStorage.sos__location;
		} else {
			var smsMessage = helpers.translit(window.localStorage.sos__message);
		}
		console.warn(smsMessage);
		for (var i = 0; i < phoneNumbers.length; i++) {
			var currentPhone = phoneNumbers[i].phone;
			var messageInfo = {
				phoneNumber: currentPhone,
				textMessage: smsMessage
			}
			sms.sendMessage(messageInfo, function(message) {
				console.log("success: " + message);
			}, function(error) {
				console.log("code: " + error.code + ", message: " + error.message);
			});
		}
	}
};
var flashUtils = {
	start: function() {
		flashingInt = setInterval(flashUtils.flash, 100);
	},
	flash: function() {
		window.plugins.flashlight.toggle();
	}
};
$sos__button.on('hold', function(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
	progressUtils.startProgress();
});
$sos__button.on('release', function(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
	buttonUtils.releaseButton();
});
$sos__button.on('touch tap', function(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
	if ($sos__button.hasClass('_flashing')) progressUtils.clearAll();
});