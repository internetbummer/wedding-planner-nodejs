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

var SeatingChartModel = function(tables, availableGuests) {
    var self = this;
    this.tables = ko.observableArray(tables);
    this.availableGuests = ko.observableArray(availableGuests);
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
            console.log("Object: "+parent()[i]);
            console.log("Count: "+count);
        }
        console.log(parent());
        console.log(count);
        return count < self.maximumGuests;
    };

    this.updateLastAction = function(arg) {
        self.lastAction("Moved " + arg.item.name() + " from " + arg.sourceParent.id + " (seat " + (arg.sourceIndex + 1) + ") to " + arg.targetParent.id + " (seat " + (arg.targetIndex + 1) + ")");
    };

    //verify that if a fourth member is added, there is at least one member of each gender
    this.verifyAssignments = function(arg) {
        var gender, found,
            parent = arg.targetParent;

        if (parent.id !== "Available Guests" && parent().length === (this.maximumGuests-1) && parent.indexOf(arg.item) < 0) {
            gender = arg.item.gender;
            if (!ko.utils.arrayFirst(parent(), function(guest) { return guest.gender !== gender;})) {
                self.lastError("Cannot move " + arg.item.name() + " to " + arg.targetParent.id + " because there would be too many " + gender + " guests");
                arg.cancelDrop = true;
            }
        }
    };
};

var extraGuests = [
    new Guest(16, "Parker", false),
    new Guest(17, "Dennis", false),
    new Guest(18, "Angel", false)
];

var initialTables = [
    new Table("Table One",  [
        new Guest(1, "Bobby", true),
        new Guest(2, "Ted", false),
        new Guest(3, "Jim", false)
    ]),
    new Table("Table Two", [
        new Guest(4, "Michelle", false),
        new Guest(5, "Erin", false),
        new Guest(6, "Chase", false)
    ]),
    new Table("Table Three", [
        new Guest(7, "Denise", false),
        new Guest(8, "Chip", false),
        new Guest(9, "Kylie", false)
    ]),
    new Table("Table Four", [
        new Guest(10, "Cheryl", false),
        new Guest(11, "Doug", false),
        new Guest(12, "Connor", false)
    ]),
    new Table("Table Five", [
        new Guest(13, "Cody", false),
        new Guest(14, "Farrah", false),
        new Guest(15, "Lyla", false)
    ])
];

var vm = new SeatingChartModel(initialTables, extraGuests);

ko.bindingHandlers.sortable.beforeMove = vm.verifyAssignments;
ko.bindingHandlers.sortable.afterMove = vm.updateLastAction;

ko.applyBindings(vm,document.getElementById('seating'));