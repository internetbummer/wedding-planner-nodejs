var Guest = function(id, name, hasGuest, rsvp, address, table, guestName) {
	if (typeof guestName === 'undefined') {
		guestName = "";
	}
    this.loaded = false;
    this.id = id;
    this.name = ko.observable(name);
    this.hasGuest = ko.observable(hasGuest);
    this.rsvp = ko.observable(rsvp);
    this.address = ko.observable(address);
    this.table = ko.observable(table);
    this.guestName = ko.observable(guestName);
    this.namePlusGuest = ko.computed(function () {
    	if (this.hasGuest()) {
    		return this.name()+"<br />"+this.guestName();
    	} else {
    		return this.name();
    	}
    }, this);
    this.saveValue = ko.computed(function () {
        if (!save_disabled && this.loaded) {
            console.log("Saving to server");
            console.log(ko.toJS(this));
            socket.emit('updateGuest', ko.toJS(this));
            this.loaded = false;
        } else {
            ko.toJS(this);
            this.loaded = true;
        }
    }, this);
};