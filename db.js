var databaseUrl = "wedding-planner";
var collections = ["users","guests","tables"];
var mongojs = require('mongojs')
  , db = mongojs.connect(databaseUrl, collections)
  , util = require('util')
  , ObjectId = mongojs.ObjectId;

exports.addGuestToTable = function (guest_id, table_id, callback) {
	db.tables.save({guest: guest_id, table: table_id}, function() {
		console.log("TABLE ID IS: "+table_id);
		if (table_id === "Available Guests") {
			table_id = -1;
		}
		db.guests.update({_id: mongojs.ObjectId(guest_id)}, {$set:{table: table_id}}, function () {
			callback();
		});
	});
};

exports.removeGuestFromTable = function (guest_id, table_id, callback) {
	db.tables.remove({guest: guest_id, table: table_id}, function() {
		callback();
	});
};

exports.getTables = function (callback) {
	db.tables.find({}, function (err, tables) {
		if (err) { console.log("ERROR getting tables: "+err); }
		callback(tables);
	});
};

exports.findOrCreate = function (profile, callback) {
    db.users.findOne({id: profile.id}, function (err, data) {
        if (data != null) {
            if (typeof data._raw !== 'undefined') {
                delete data['_raw'];
                delete data['_json'];
                db.users.update({id:profile.id},data);
            }
            console.log("USER FOUND "+data.displayName);
            callback(err,data);
        } else {
            delete profile['_raw'];
            delete profile['_json'];
            db.users.save(profile);
            callback(null,profile);
        }
    });
};

exports.findUserById = function (id, callback) {
    db.users.findOne({id: id}, function (err, data) {
        if (data != null) {
            callback(data);
        } else {
            console.log("Could not find user with id: "+id);
            console.log(err);
        }
    });
};

exports.getGuests = function (callback) {
	db.guests.find({}, function(err, data) {
		if (err) { console.log("ERROR: "+err); }
		callback(data);
	});
};

exports.removeGuest = function (id) {
	console.log("REMOVE ID: "+id);
	var objectId = mongojs.ObjectId(id);
	db.guests.remove({_id: objectId}, function (err) {
		if (err) { console.log(err); }
	});
};

exports.updateGuests = function (guests) {
	for (var i = 0; i < guests.length; i++) {
		var guest = guests[i];
		console.log(guest);
		guest._id = mongojs.ObjectId(guest.id);
		db.guests.update({_id: guest._id}, guest, function(err, updatedGuest){
			console.log(updatedGuest);
		});
	}
};

exports.addGuest = function (name, callback) {
	var guest = {
		name: name,
		address: "",
		hasGuest: false,
		rsvp: false,
		table: -1,
		guestName: ""
	};
	db.guests.save(guest, function(err,data) {
		if (err) { console.log("ERROR: "+err); }
		callback(data);
	})
};

exports.updateSettings = function (id, settings) {
    db.users.update({id: id}, { $set: { settings: settings } } , function(err) {
        console.log("ERROR: "+err);
    });
};

exports.getSettings = function (id, callback) {
    db.users.findOne({id: id}, { settings: 1 }, function (err, data) {
        if (data != null) {
            callback(data.settings);
        } else {
            console.log("Could not find settings");
            callback(null);
        }
    });
};

exports.getUsers = function (callback) {
    db.users.find({}, function (err, data) {
        if (data != null) {
            callback(data);
        } else {
            console.log("Error getting users: "+err);
            callback(null);
        }
    });
};