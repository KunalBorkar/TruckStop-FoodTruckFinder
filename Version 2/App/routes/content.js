var sanitize = require('validator').sanitize; // Helper to sanitize form input
var UsersDAO = require('../users').UsersDAO;

/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";
    var users = new UsersDAO(db);

    this.displayMainPage = function(req, res, next) {
        "use strict";

		return res.render("FirstPage");
    }
	
	this.displayTruckSignupPage = function(req, res, next) {
        "use strict";

		return res.render('truckSignUp');
    }
	
	this.displayTruckUserDashboardPage = function(req, res, next) {
        "use strict";

		return res.render('truckUserDashboard');
    }

	/*this.displayUserDashboardPage = function(req, res, next) {
        "use strict";

		return res.render('userDashboard');
    }*/


    this.displayEditProfilePage = function(req, res, next) {
        "use strict";

        return res.render('EditProfile');
    }


   // var users= db.collection('user');
    this.displayProfile = function(req, res, next) {
        "use strict";

          users.findOne({ '_id' : "n@yahoo.com"}, function(err, user) {
            "use strict";   

            console.log(user.Distance);
            return res.render('GenUserProfile',{'firstName':user.firstName,'lastName': user.lastName,'EmailAddress': user._id,'WhatILike': user.whatilike,'Distance':user.Distance});

        });

    }

    this.displayUserDashboardPage = function(req, res, next) {
        "use strict";
        users.findLocation(req.username, function(err, user) {
            if (err) {
                // this was a duplicate
                if (err.code == '11000') {
                    errors['email_error'] = "This Email Address is already Signed Up!!";
                    return res.render("truckstop", errors);
                }
                // this was a different error
                else {
                    return next(err);
                }
            }

            users.getTrucks(4, function(err, results) {
                "use strict";

                if (err) return next(err);
                return res.render("userDashboard", {'latitude': user.latitude, 'longitude': user.longitude, 'locations':results})
            });
        });
    }
}

module.exports = ContentHandler;