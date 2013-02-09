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
for (var i = 1; i < 17; i++) {
    var table = new Table("Table "+i, []);
    initialTables.push(table);
}

var vm = new SeatingChartModel(initialTables);

ko.bindingHandlers.sortable.beforeMove = vm.verifyAssignments;
ko.bindingHandlers.sortable.afterMove = vm.updateLastAction;

ko.applyBindings(vm,document.getElementById('seating'));