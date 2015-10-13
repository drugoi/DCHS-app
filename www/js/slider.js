$('.slider__contact-add').on('click tap touch', function(event) {
	var randomId = $('.sos__contacts li').length;
	navigator.contacts.pickContact(function(contact) {
		if (contact.phoneNumbers[0].value) {
			$('.slider__contacts').append('<li data-id="' + randomId + '" class="item slider__contact-remove">' + contact.displayName + ' <i class="icon-right ion-ios-close-outline"></i></li>');
			var phone = JSON.stringify(contact.phoneNumbers[0].value).replace('+7', '8');
			phoneNumbers.push({
				name: contact.displayName,
				phone: phone
			});
			window.localStorage.phones = JSON.stringify(phoneNumbers);
		} else {
			//alert('У этого контакта нет телефона, ёпта!');
		}
		if ($('.slider__contacts li').length === 3) {
			$('.slider__contact-add').hide();
		}
	}, function(err) {
		alert('Error: ' + err);
	});
});
$(document).on('click tap touch', '.sos__contact-remove', function() {
	console.log($(this).data('id'));
	if (confirm('Вы действительно хотите удалить данный контакт из списка рассылки?')) {
		$('.slider__contacts .item[data-id="' + $(this).data('id') + '"]').remove();
		var currentLength = $('.slider__contacts .item').length;
		for (var i = 0; i < currentLength; i++) {
			$('.slider__contacts .item').eq(i).attr('data-id', i);
		}
		phoneNumbers.splice($(this).data('id'), 1);
		window.localStorage.phones = JSON.stringify(phoneNumbers);
		$('.slider__contact-add').show();
	} else {
		// nothing
	}
});
$('.slider__message').on('blur', function() {
	window.localStorage.sos__message = '';
	window.localStorage.sos__message = $(this).val();
});
$('.finish__button').on('click tap touch', function() {
	window.localStorage.intro = 'true';
});