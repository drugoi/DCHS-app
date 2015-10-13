
if (phoneNumbers.length > 0) {
	for (var i = 0; i < phoneNumbers.length; i++) {
		$('.sos__contacts').append('<li data-id="' + i + '" class="item sos__contact-remove">' + phoneNumbers[i].name + ' <i class="icon-right ion-ios-close-outline"></i></li>');
		$('.sos__test').append('<li class="item">' + phoneNumbers[i].phone + '</li>');
	}
	if (phoneNumbers.length === 3) {
		$('.sos__contact-add').hide();
	}
}
$('.sos__gps').on('change', function() {
	if ($(this).prop('checked') === false) {
		window.localStorage.sos__gps = false;
	} else {
		window.localStorage.sos__gps = true;
	}
});
$('.sos__flash').on('change', function() {
	if ($(this).prop('checked') === false) {
		window.localStorage.sos__flash = false;
	} else {
		window.localStorage.sos__flash = true;
	}
});
$('.sos__contact-add').on('click tap touch', function(event) {
	var randomId = $('.sos__contacts li').length;
	navigator.contacts.pickContact(function(contact) {
		if (contact.phoneNumbers[0].value) {
			$('.sos__contacts').append('<li data-id="' + randomId + '" class="item sos__contact-remove">' + contact.displayName + ' <i class="icon-right ion-ios-close-outline"></i></li>');
			var phone = JSON.stringify(contact.phoneNumbers[0].value).replace('+7', '8');
			phoneNumbers.push({
				name: contact.displayName,
				phone: phone
			});
			window.localStorage.phones = JSON.stringify(phoneNumbers);
		} else {
			alert('У этого контакта нет телефона, ёпта!');
		}
		if ($('.sos__contacts li').length === 3) {
			$('.sos__contact-add').hide();
		}
	}, function(err) {
		alert('Error: ' + err);
	});
});
$(document).on('click tap touch', '.sos__contact-remove', function() {
	console.log($(this).data('id'));
	if (confirm('Вы действительно хотите удалить данный контакт из списка рассылки?')) {
		$('.sos__contacts .item[data-id="' + $(this).data('id') + '"]').remove();
		var currentLength = $('.sos__contacts .item').length;
		
		for (var i = 0; i < currentLength; i++) {
			$('.sos__contacts .item').eq(i).attr('data-id', i);
		}
		
		phoneNumbers.splice($(this).data('id'), 1);
		window.localStorage.phones = JSON.stringify(phoneNumbers);
		$('.sos__contact-add').show();
	} else {
		// nothing
	}
});
$('.sos__message').on('blur', function() {
	window.localStorage.sos__message = '';
	window.localStorage.sos__message = $(this).val();
});