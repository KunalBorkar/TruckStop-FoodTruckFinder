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
}

module.exports = ContentHandler;