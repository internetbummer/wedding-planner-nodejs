var guest_index = {};
ko.bindingHandlers.flash = {
    init: function(element) {
        $(element).hide();
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value) {
            $(element).stop().hide().text(value).fadeIn(function() {
                clearTimeout($(element).data("timeout"));
                $(element).data("timeout", setTimeout(function() {
                    $(element).fadeOut();
                    valueAccessor()(null);
                }, 3000));
            });
        }
    },
    timeout: null
};

var Table = function(id, guests) {
    this.guests = ko.observableArray(guests);
    this.guests.id = id;
};

var SeatingChartModel = function(tables) {
    var self = this;
    this.tables = ko.observableArray(tables);
    this.availableGuests = ko.observableArray();
    this.availableGuests.id = "Available Guests";
    this.lastAction = ko.observable();
    this.lastError = ko.observable();
    this.maximumGuests = 10;
    this.isTableFull = function(parent) {
        var count = 0;
        for (var i = 0; i < parent().length; i++) {
            count++;
            if (parent()[i].hasGuest()) {
                count++;
            }
        }
        return count < self.maximumGuests;
    };

    this.updateLastAction = function(arg) {
        self.lastAction("Moved " + arg.item.name() + " from " + arg.sourceParent.id + " (seat " + (arg.sourceIndex + 1) + ") to " + arg.targetParent.id + " (seat " + (arg.targetIndex + 1) + ")");
        console.log(arg.item);
        socket.emit('addGuestToTable', arg.item.id, arg.targetParent.id);
        socket.emit('removeGuestFromTable', arg.item.id, arg.sourceParent.id);
    };

    //verify that if a fourth member is added, there is at least one member of each gender
    this.verifyAssignments = function(arg) {
        var found,
            parent = arg.targetParent;

        if (parent.id !== "Available Guests" && parent().length === (this.maximumGuests-1) && parent.indexOf(arg.item) < 0) {
            arg.cancelDrop = true;
        }
    };
};

var initialTables = [];
for (var i = 0; i < 17; i++) {
    var table = new Table(i, []);
    initialTables.push(table);
}

var vm = new SeatingChartModel(initialTables);

ko.bindingHandlers.sortable.beforeMove = vm.verifyAssignments;
ko.bindingHandlers.sortable.afterMove = vm.updateLastAction;

ko.applyBindings(vm,document.getElementById('seating'));

$(document).on( 'loaded' , function (e) {
    socket.on('guestRemovedFromTable', guestRemovedFromTable);
    socket.on('guestAddedToTable', guestAddedToTable);
    loadTables();
});

function guestRemovedFromTable(guest_id, table_id) {
    console.log("Removing "+guest_id+" from table "+table_id);
    if (vm.tables()[table_id].guests.indexOf(guest_index[guest_id]) !== -1) {
        vm.tables()[table_id].guests.remove(guest_index[guest_id]);
    }
};

function guestAddedToTable (guest_id, table_id) {
    console.log("Adding "+guest_id+" to table "+table_id);
    if (vm.tables()[table_id].guests.indexOf(guest_index[guest_id]) === -1) {
        vm.tables()[table_id].guests.push(guest_index[guest_id]);
    }
};

function loadTables() {
    vm.availableGuests.removeAll();
    for (var i = 0; i < vm.tables().length; i++) {
        vm.tables()[i].guests.removeAll();
    }
    console.log("LOADING TABLES");
    socket.emit('getGuests', function (guests) {
        console.log(vm.tables());
        for (var i = 0; i < guests.length; i++) {
            var g = guests[i];
            var guest = new Guest(g.id,g.name,g.hasGuest,g.rsvp,g.address,g.table,g.guestName);
            guest_index[g.id] = guest;
            console.log(guest.table_id);
            if (typeof g.table === 'undefined' || g.table === 0 || g.table === "0" || g.table === "Available Guests") {
                vm.availableGuests.push(guest);
            } else {
                console.log(g.name+" "+g.table);
                vm.tables()[g.table].guests.push(guest);
            }
        }
    });
};