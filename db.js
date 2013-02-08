var databaseUrl = "wedding-planner";
var collections = ["users","guests","seating"];
var mongojs = require('mongojs')
  , db = mongojs.connect(databaseUrl, collections)
  , util = require('util')
  , ObjectId = mongojs.ObjectId;

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
}

exports.addGuest = function (name, callback) {
	var guest = {
		name: name,
		address: "",
		hasGuest: false,
		rsvp: false,
		table: 0
	};
	db.guests.save(guest, function(err,data) {
		if (err) { console.log("ERROR: "+err); }
		callback(data);
	})
}

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