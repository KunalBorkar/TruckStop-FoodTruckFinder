var UsersDAO = require('../users').UsersDAO
  , SessionsDAO = require('../sessions').SessionsDAO;

/* The SessionHandler must be constructed with a connected db */
function SessionHandler (db) {
    "use strict";

    var users = new UsersDAO(db);
    var sessions = new SessionsDAO(db);

    this.isLoggedInMiddleware = function(req, res, next) {
        var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username) {
            "use strict";

            if (!err && username) {
                req.username = username;
            }
            return next();
        });
    }

    this.displayLoginPage = function(req, res, next) {
        "use strict";
        return res.render("login", {emailID:"", passwd:"", login_error:"", username_error:""})
    }

	this.displayWelcome = function(req,res,next){ //Login function
	
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var emailAddress= req.body.emailAddress;
	var password = req.body.password;
	var radio = req.body.truckOwner;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    console.log(req.body);
	
	console.log(radio);
	
	var emailID = req.body.emailID;
	var passwd = req.body.passwd;
	
	if(firstName == null && lastName == null && emailAddress == null && password == null)
	{
		var username = req.body.emailID;
        var password = req.body.passwd;

        console.log("user submitted username: " + username + " pass: " + password);

        users.validateLogin(username, password, function(err, user) {
            "use strict";

            if (err) {
			
                if (err.no_such_user) {
                    return res.render("login", {emailID:username, passwd:"", username_error:"No such user"});
                }
                else if (err.invalid_password) {
                    return res.render("login", {emailID:username, passwd:"", login_error:"Invalid password"});
                }
                else {
                    // Some other kind of error
                    return next(err);
                }
            }

            sessions.startSession(user['_id'], function(err, session_id) {
                "use strict";

                if (err) return next(err);

                res.cookie('session', session_id);
                return res.redirect('/FirstPage');
            });
        });

	}
	if(emailID == null && passwd == null)
	{
		var errors = {'email': emailAddress}
        if (validateSignup(firstName, lastName, emailAddress, password, radio, errors)) {
            users.addUser(firstName, lastName, emailAddress, password, radio, latitude, longitude, function(err, user) {
                "use strict";

                if (err) {
                    // this was a duplicate
                    if (err.code == '11000') {
                        errors['email_error'] = "This Email Address is already Signed Up!!";
                        return res.render("FirstPage", errors);
                    }
                    // this was a different error
                    else {
                        return next(err);
                    }
                }

                sessions.startSession(user['_id'], function(err, session_id) {
                    "use strict";

                    if (err) return next(err);

                    res.cookie('session', session_id);
                    return res.redirect('/FirstPage');
                });
            });
        }
        else {
            console.log("user did not validate");
            return res.render("FirstPage", errors);
        }
	}
	}
	
	
    this.displayLogoutPage = function(req, res, next) {
        "use strict";

        var session_id = req.cookies.session;
        sessions.endSession(session_id, function (err) {
            "use strict";

            // Even if the user wasn't logged in, redirect to home
            res.cookie('session', '');
            return res.redirect('/');
        });
    }

    function validateSignup(firstName, lastName, emailAddress, password, radio, errors) {
        "use strict";
		
		var FIRST_RE = /^[a-zA-Z_]{3,20}$/
        var LAST_RE = /^[a-zA-Z]{3,20}$/;
		var EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;
        var PASS_RE = /^.{3,20}$/;
        

        errors['firstname_error'] = "";
		errors['lastname_error'] = "";
		errors['email_error'] = "";
        errors['password_error'] = "";
		errors['radio_error'] = "";
		
        
        if (!FIRST_RE.test(firstName)) {
            errors['firstname_error'] = "invalid first name. try just letters and numbers";
            return false;
        }
		
		if (!LAST_RE.test(lastName)) {
            errors['lastname_error'] = "invalid last name. try just letters and numbers";
            return false;
        }
		
		if (emailAddress != "") {
            if (!EMAIL_RE.test(emailAddress)) {
                errors['email_error'] = "invalid email address";
                return false;
            }
        }

        if (!PASS_RE.test(password)) {
            errors['password_error'] = "invalid password.";
            return false;
        }
		
		if(radio == null)
		{
			errors['radio_error'] = "Select Yes or No";
		}
				
        return true;
    }

    this.displayWelcomePage = function(req, res, next) {
        "use strict";

        if (!req.username) {
            console.log("welcome: can't identify user...redirecting to signup");
            return res.redirect("/truckstop");
        }

        return res.render("welcome", {'username':req.username})
    }
}

module.exports = SessionHandler;
