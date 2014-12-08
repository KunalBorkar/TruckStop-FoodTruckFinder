var sanitize = require('validator').sanitize; // Helper to sanitize form input
var UsersDAO = require('../users').UsersDAO;
var distance = require('google-distance-matrix');

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


   


    var us= db.collection('user');
    this.displayEditProfilePage = function(req, res, next) {
        "use strict";


         var userID= req.username;
          us.findOne({ '_id' : userID}, function(err, user) {
            "use strict"; 

        return res.render('EditProfile',{'firstName': user.firstName, 'lastName': user.lastName, 'emailAddress' : user._id});
    });
    }


    //var users= db.collection('user');
    this.displayProfile = function(req, res, next) {
        "use strict";

         var userID= req.username;
          us.findOne({ '_id' : userID}, function(err, user) {
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

            users.getTrucks(5,user.latitude, user.longitude, function(err, results) {
/*                "use strict";
                if (err) return next(err);
                var finalArray = [];
                results.forEach(function(value) {
                    console.log("Inside for each loop "+ value);
                    finalArray.push(value);

                    var origins = [user.latitude+','+user.longitude];
                    var destinations = [value.latitude+','+value.longitude];
                    console.log(origins);
                    distance.units('imperial');
                    distance.matrix(origins, destinations, function (err, distances) {
                        if (!err)
                            console.log(distances.rows[0].elements[0].distance.value);
                            var distanceValue = distances.rows[0].elements[0].distance.value;
                            if(distanceValue > 6700){
                                finalArray.push(value);
                            }
                    });
                });*/
                console.log("Printing results Array "+results);
                return res.render("userDashboard", {'latitude': user.latitude, 'longitude': user.longitude, 'locations':results})
            });
        });
    }
}

module.exports = ContentHandler;