
/*
 * GET home page.
 */

var db = require('../db.js')
    , util = require('util');


exports.index = function(req, res){
    if (req.isAuthenticated()) {
    	res.render('index', { title: 'Wedding Planner'});
    } else {
	    res.redirect('/auth/google');
	}
};

// exports.index = function(req, res){
//     res.render('index', { title: 'Wedding Planner' });
// };

exports.checkAuth = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/auth/google');
};