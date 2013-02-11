var Guest = function(id, name, hasGuest, rsvp, address, table, guestName) {
	if (typeof guestName === 'undefined') {
		guestName = "";
	}
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
};