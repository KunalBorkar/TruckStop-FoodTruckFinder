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
		if(req.cookies.session.length!=0)
		{
			return res.render('truckOwnerSignUp');
		}
		else
		{
			return res.redirect('/');
		}
    }
	
	this.displayTruckOwnerDashboardPage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
			users.getSubscriptions(req.username, function(err, subscriptions) {
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
			return res.render('truckOwnerDashboard', {'userSubscriptions' : subscriptions['subscription']});
			});
		}
		else
		{
			return res.redirect('/');
		}
    }

	this.displaySearchPage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
			return res.render('truckOwnerDashboard');
		}
		else
		{
			return res.redirect('/');
		}
    }
	
	this.displaySubscriptionPage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
		users.getSubscriptions(req.username, function(err, subscriptions) {
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
				//var subscriptionLength = subscriptions.subscription.length;
				if(subscriptions.subscription == null)
				{
					return res.render('userSubscriptions', {'noSubscription' : "You Dont have any subscriptions!! Add Now"});
				}
				else 
				{
                    if(subscriptions.subscription.length == 0)
                    {
                        return res.render('userSubscriptions', {'noSubscription' : "You Dont have any subscriptions!! Add Now"});
                    }
                    else{
                        return res.render('userSubscriptions', {'userSubscriptions' : subscriptions['subscription']});
                    }

				}
			});
			}
		else
		{
			return res.redirect('/');
		}
		}

    this.displayEditProfilePage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
			return res.render('EditProfile');
		}
		else
		{
			return res.redirect('/');
		}
    }

	this.displayServeTodayPage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
			return res.render('serveToday');
		}
		else
		{
			return res.redirect('/');
		}
    }

    this.displayProfile = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
			users.findOne({ '_id' : "n@yahoo.com"}, function(err, user) {
            console.log(user.Distance);
            return res.render('GenUserProfile',{'firstName':user.firstName,'lastName': user.lastName,'EmailAddress': user._id,'WhatILike': user.whatilike,'Distance':user.Distance});
			});
		}
		else
		{
			return res.redirect('/');
		}

    }

    this.displayUserDashboardPage = function(req, res, next) {
        "use strict";
		if(req.cookies.session.length!=0)
		{
        users.findLocation(req.username, function(err, user) {
            if (err) {
                if (err.code == '11000') {
                    errors['email_error'] = "This Email Address is already Signed Up!!";
                    return res.render("truckstop", errors);
                }

                else {

                    return next(err);
                }
            }
            users.getTrucks(5,user.latitude, user.longitude, function(err, results) {
                console.log("Printing results Array "+results);
                return res.render("userDashboard", {'latitude': user.latitude, 'longitude': user.longitude, 'locations':results})
            });
        });

		}
		else
		{
			return res.redirect('/');
		}
    }
	
	this.displayFoodtruck = function(req, res, next){
	"use strict";
		if(req.cookies.session.length!=0)
		{
		users.getFoodTruckInfo(req.params.foodTruckName, function (err, foodTruckInfo) {
			if (err) {
					if (err.code == '11000') {
						errors['email_error'] = "This Email Address is already Signed Up!!";
						return res.render("truckstop", errors);
					}
					else {
						return next(err);
					}
				}
					var foodTruckOwnerName = foodTruckInfo['firstName'] + " " + foodTruckInfo['lastName']
					return res.render('foodTruck', {'foodTruckName' : foodTruckInfo['food_truck_name'], 'foodTruckOwner': foodTruckOwnerName, 'aboutMe': foodTruckInfo['about_me'], 'cuisine': foodTruckInfo['speciality_cuisine'], 'operatingHours': foodTruckInfo['operating_hours'], 'foodTruckUserID': foodTruckInfo['_id']});
			});
		}
		else
		{
			return res.redirect('/');
		}
	}
	
	this.displayImage = function(req, res, next){
		users.getFoodTruckOwnerImage(req.username, function(err, resultImage) {
			res.end(resultImage.image.buffer, "binary");
		});
	}
}

module.exports = ContentHandler;