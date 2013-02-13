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
			self.tracker().markCurrentStateAsClean;
			save_disabled = false;
		})
		self.guests.remove(guest);
	};
};

guestModel = new GuestModel();

guestModel.tracker = ko.ChangeTracker(guestModel);
isDirty = ko.computed(function () {
	var val = guestModel.tracker().somethingHasChanged();
	if (val) {
		save();
	}
	return val;
});
guestModel.tracker().markCurrentStateAsClean;
ko.applyBindings(guestModel, document.getElementById('guestlist'));

$(document).on( 'loaded' , function (e) {
	socket.on('guestAdded', function(guest) {
		var oldGuest = ko.utils.arrayFirst(guestModel.guests(), function (currentGuest) {
			return currentGuest.id === guest.id;
		});
		if (oldGuest) {
			guestModel.guests.remove(oldGuest);
		}
		guestModel.guests.push(guest);
		guestModel.tracker().markCurrentStateAsClean;
	});
	socket.on('guestUpdated', function (guest) {
		updateGuests();
	});
	socket.on('updatedGuests', update_guests);
	socket.emit('getGuests', update_guests);
});

function updateGuests() {
	socket.emit('getGuests', update_guests);
};

function update_guests(guests) {
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
		guestModel.guests.push(new Guest(guest.id,guest.name,guest.hasGuest,guest.rsvp,guest.address,guest.table,guest.guestName));
	}
	guestModel.tracker().markCurrentStateAsClean;
	save_disabled = false;
};

function save() {
	if (!save_disabled) {
		console.log("saving...");
		socket.emit('updateGuests', ko.toJS(guestModel.guests));
	}
};