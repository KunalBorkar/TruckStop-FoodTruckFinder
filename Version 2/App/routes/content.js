var sanitize = require('validator').sanitize; // Helper to sanitize form input

/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";

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



    this.displayEditProfilePage = function(req, res, next) {
        "use strict";

        return res.render('EditProfile');
    }


    var users= db.collection('user');
    this.displayProfile = function(req, res, next) {
        "use strict";

          users.findOne({ '_id' : "n@yahoo.com"}, function(err, user) {
            "use strict";   

            console.log(user.Distance);
            return res.render('GenUserProfile',{'firstName':user.firstName,'lastName': user.lastName,'EmailAddress': user._id,'WhatILike': user.whatilike,'Distance':user.Distance});

        });

    }   
}

module.exports = ContentHandler;