var Guest = function(id, name, hasGuest, rsvp, address, table, guestName) {
    this.id = id;
    this.name = ko.observable(name);
    this.hasGuest = ko.observable(hasGuest);
    this.rsvp = ko.observable(rsvp);
    this.address = ko.observable(address);
    this.table = ko.observable(table);
    this.guestName = ko.observable(guestName);
};