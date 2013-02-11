
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, passport = require('passport')
	, user = require('./routes/user')
	, RedisStore = require('connect-redis')(express)
	, http = require('http')
	, myDb = require('./db.js')
	, util = require('util')
	, connect = require('express/node_modules/connect')
	, parseSignedCookie = connect.utils.parseSignedCookie
	, cookie = require('express/node_modules/cookie')
	, sessionStore = new RedisStore()
	, passConfig = require('./passport-config.js')
	, GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
	, path = require('path');

var app = express();

var secret = 'w3dd1ng';

app.configure(function(){
	app.set('port', process.env.PORT || 4000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(secret));
	app.use(express.session({secret: secret, store: sessionStore}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public', paths: [ __dirname + '/public/stylesheets', __dirname+ '/public/stylesheets/bootstrap'] }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.send(500, 'Something broke!');
	});
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.checkAuth, routes.index);
app.get('/users', user.list);

app.get('/auth/google',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
											'https://www.googleapis.com/auth/userinfo.email'] }),
	function(req,res) {

	}
);

app.get('/logout', routes.logout);

app.get('/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req,res) {
		res.redirect('/');
	}
);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
			console.log("Express server listening on port " + app.get('port'));
});
var io = require('socket.io').listen(server);
io.configure(function () {
		io.disable('log');
		io.enable('browser client minification');
		io.enable('browser client etag');
		//io.enable('browser client gzip');
});
io.configure('development', function () {
		io.enable('log');
});

io.set('authorization', function(data,accept) {
		if (data.headers.cookie) {
				data.cookie = cookie.parse(data.headers.cookie);
				if (data.cookie && data.cookie['connect.sid']) {
						data.sessionID = parseSignedCookie(data.cookie['connect.sid'], secret);
						sessionStore.get(data.sessionID, function(err,session) {
								if (err || !session) {
										accept(Error, false);
								} else {
										data.session = session;
										accept(null, true);
								}
						});
				} else {
						return accept(null, true);
				}
		} else {
				console.error("No cookies were found");
				return accept('No cookie transmitted.', false);
		}
});

setInterval(function() {
		getSignedInUsers (io,function(clients){
				io.sockets.volatile.emit('signed_in_users', clients);
		});
}, 5000);

var namedSockets = {};

io.sockets.on('connection', function(socket) {
	console.log("new connection");
	console.log(socket.handshake.session.passport.user.displayName+' has connected to a socket');
	namedSockets[socket.handshake.session.passport.user.id] = socket;
	getSignedInUsers(io, function(clients) {
		socket.emit('signed_in_users', clients);
	});
	socket.on('addGuest', function(name) {
		myDb.addGuest(name, function(guest) {
			myDb.getGuests(function(guests) {
				io.sockets.emit('updatedGuests', guests);
			});
		});
	});
	socket.on('getGuests', function(callback) {
		myDb.getGuests(function(guests) {
			callback(guests);
		});
	});
	socket.on('removeGuest', function(id) {
		myDb.removeGuest(id, function() {
			myDb.getGuests(function(guests) {
				io.sockets.emit('updatedGuests', guests);
			});
		});
	});
	socket.on('updateGuests', function(guests,callback) {
		myDb.updateGuests(guests, function() {
			myDb.getGuests(function(updatedGuests) {
				callback(updatedGuests);
			});
		});
	});
	socket.on('addGuestToTable', function (guest_id, table_id) {
		myDb.addGuestToTable(guest_id, table_id, function() {
			io.sockets.emit('guestAddedToTable', guest_id, table_id);
		});
	});
	socket.on('removeGuestFromTable', function (guest_id, table_id) {
		myDb.removeGuestFromTable(guest_id, table_id, function() {
			io.sockets.emit('guestRemovedFromTable', guest_id, table_id);
		});
	});

	socket.on('getTables', function (callback) {
		myDb.getTables(function(tables) {
			callback(tables);
		});
	});
});

function getSignedInUsers (io,callback) {
	var sockets = io.sockets.clients();
	var clients = {};
	for (var i = 0; i < sockets.length; i++) {
		if (sockets[i].handshake.session && sockets[i].handshake.session.passport.user.id) {
			clients[sockets[i].handshake.session.passport.user.id] = sockets[i].handshake.session.passport.user.displayName;
		}
	}
	callback(clients);
};

passport.use(new GoogleStrategy({
		clientID: passConfig.clientID,
		clientSecret: passConfig.clientSecret,
		callbackURL: passConfig.callbackURL
	},
	function(token, tokenSecret, profile, done) {
		myDb.findOrCreate(profile, function (err, user) {
			return done(err, user);
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});