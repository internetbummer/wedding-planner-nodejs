var save_disabled = true;
var GuestModel = function() {
	var self = this;
	self.guests = ko.observableArray();
	self.addGuest = function() {
		var name = $('#nameToAdd').val();
		$('#nameToAdd').val("");
		if (name !== "") {
			socket.emit("addGuest", name);
		}
	};
	self.guestCount = ko.computed(function () {
		var count = 0;
		for (var i = 0; i < self.guests().length; i++) {
			count++;
			var guest = self.guests()[i];
			if (guest.hasGuest()) {
				count++;
			}
		}
		return count;
	});
	self.removeGuest = function(guest) {
		socket.emit('removeGuest', guest.id, function () {
			save_disabled = true;
			self.guests.remove(guest);
			save_disabled = false;
		});
		self.guests.remove(guest);
	};
};

guestModel = new GuestModel();
ko.applyBindings(guestModel, document.getElementById('guestlist'));

$(document).on( 'loaded' , function (e) {
	socket.on('guestAdded', function(guest) {
		var oldGuest = ko.utils.arrayFirst(guestModel.guests(), function (currentGuest) {
			return currentGuest.id === guest.id;
		});
		if (oldGuest) {
			guestModel.guests.remove(oldGuest);
		}
		var newGuest = new Guest(guest.id,guest.name,guest.hasGuest,guest.rsvp,guest.address,guest.table,guest.guestName);
		guestModel.guests.push(newGuest);
	});
	socket.on('guestUpdated', function (guest) {
		if (!guest.id) {
			guest.id = guest._id;
		}
		var newGuest = new Guest(guest.id,guest.name,guest.hasGuest,guest.rsvp,guest.address,guest.table,guest.guestName);
		var oldGuest = ko.utils.arrayFirst(guestModel.guests(), function (currentGuest) {
			return currentGuest.id === guest.id;
		});
		if (oldGuest) {
			guestModel.guests.remove(oldGuest);
		}
		guestModel.guests.push(newGuest);
	});
	//socket.on('updatedGuests', update_guests);
	socket.emit('getGuests', function (guests) {
		save_disabled = true;
		for (var i = 0; i < guests.length; i++) {
			var guest = guests[i];
			if (!guest.id) {
				guest.id = guest._id;
			}
			var oldGuest = ko.utils.arrayFirst(guestModel.guests(), function (currentGuest) {
				return currentGuest.id === guest.id;
			});
			if (oldGuest) {
				guestModel.guests.remove(oldGuest);
			}
			var newGuest = new Guest(guest.id,guest.name,guest.hasGuest,guest.rsvp,guest.address,guest.table,guest.guestName);
			guestModel.guests.push(newGuest);
		}
		save_disabled = false;
	});
});
