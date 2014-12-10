var bcrypt = require('bcrypt-nodejs')
	, MongoDb = require("mongodb")
	, fs = require("fs")
	, distance = require('google-distance-matrix');

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("user");
	var userImages = db.collection("userImage");
    var trucks = db.collection("trucks");
	var today = db.collection("tempMenuStore");

    this.addUser = function(firstName, lastName, emailAddress, password, radio, latitude, longitude, callback) {
        "use strict";
		
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        var user = {'_id': emailAddress, 'firstName': firstName, 'lastName': lastName, 'password': password_hash, 'truckOwner': radio, 'latitude': latitude, 'longitude':longitude};

		users.insert(user, function(err, result){
			callback(err, user);
		});
        //
    }

    this.validateLogin = function(username, password, callback) {
        "use strict";

		users.findOne({ '_id' : username }, function(err, user) {
            "use strict";

            if (err) return callback(err, null);

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        });
		}
		
		this.addTruckUserProfile = function(userID, foodTruckName, licenseNumber, specialityCuisineYouServe, SpecialityCuisineILike, operatingHours, aboutMe, profileImage, currentLatitude, currentLongitude, callback) {
		"use strict";
		
		
		var truckUserProfileInfo = {$set : {'food_truck_name': foodTruckName, 'license_number': licenseNumber, 'whatyouserve': specialityCuisineYouServe,'whatilike': SpecialityCuisineILike, 'operating_hours': operatingHours, 'about_me': aboutMe, 'latitude' : currentLatitude, 'longitude': currentLongitude}};
		
		var data = fs.readFileSync(profileImage.path);
		var image = new MongoDb.Binary(data);
        var imageType = profileImage.type;
        var imageName = profileImage.name;
		
		var userImageInfo = {'_id': userID, 'image': image, 'image_type': imageType, 'image_name': imageName}
		
		
		
		users.update({'_id': userID},truckUserProfileInfo, function(err, result){
		userImages.save(userImageInfo, function(err, result){ 
		callback(err, truckUserProfileInfo);
		});
			
		});	
	}
	
	this.showProfile = function (id, callback) {
		userProfiles.findOne({'_id': id}, function(err, user){
			callback(err, user);
		});
	}

    //Function to get latitude and longitude of a user.
    this.findLocation = function (username, callback) {
        users.findOne({'_id': username}, function(err, user){
            callback(err, user);
        });
    }

		this.getTrucks = function(num,userLatitude, userLongitude, callback) {
        "use strict";

        trucks.find().sort('_id', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " posts");
            console.log("Result " + items);


            var finalArray = [];
            var count = 0;
            items.forEach(function(value) {
                console.log("Inside for each loop "+ value);
                //finalArray.push(value);

                var origins = [userLatitude+','+userLongitude];
                var destinations = [value.latitude+','+value.longitude];
                console.log(origins);
                distance.units('imperial');
                distance.matrix(origins, destinations, function (err, distances) {
                    if (!err)
                        console.log(distances.rows[0].elements[0].distance.value);
                    var distanceValue = distances.rows[0].elements[0].distance.value;
                    console.log(value.name + " has a distance of " + distanceValue);
                    if(distanceValue < 10000){
                        console.log("Printing distance value "+distanceValue)
                        finalArray.push(value);
                        console.log("Prinitng finalArray inside if loop " + finalArray)
                    }
                    count++
                    console.log("Printing count " +count);
                    console.log("Printing lenght of items array "+ items.length.toString());
                    if(count==items.length){
                        console.log("Printing final Array "+ finalArray);
                        callback(err, finalArray);
                    }
                });
            });
        });
    }
	
	this.addTodaysInformation = function (userID, todayMenu, todaysMenuTags, callback) {
		
		today.update({'_id': userID}, {$set : {'menu': todayMenu, 'cuisine': todaysMenuTags}}, {upsert: true}, function (err, todaysInfo) {
			callback(err, todaysInfo);
		});
	}

	this.getSubscriptions = function (userID, callback) {
		
		users.findOne({'_id': userID}, function (err, subscriptions) {
			callback(err, subscriptions);
		});
	}
	
	this.unsubscribe = function (userID, unsubscribedFoodtruck, callback) {
	
		var unsubscribeQuery = {$pull: {'subscription' : unsubscribedFoodtruck} }
		
		users.update({'_id':userID}, unsubscribeQuery, function (err, unsubscribed) {
			callback(err, unsubscribed);
		});
	}
	
	this.getFoodTruckInfo = function (foodTruckName, callback) {
	
	var foodTruck = {'food_truck_name' : foodTruckName}

		users.findOne(foodTruck, function (err, foodTruckInfo) {
			callback(err, foodTruckInfo);
		});
	}
	
	this.getFoodTruckOwnerImage = function(userID, callback) {
		console.log("FoodTruckImage"+ userID);
		userImages.findOne({'_id':userID}, function (err, foodTruckImage) {
				callback(err, foodTruckImage);
		});
	}
	
	this.updateCurrentLocationforUser = function (username, currentlatitude, currentlongitude, callback) {
        console.log("In DisplayWelcome Users current lat and longi are:" + currentlatitude + " " + currentlongitude);
        users.update({'_id': username}, {$set: {'latitude': currentlatitude, 'longitude': currentlongitude}}, function (err, user) {
            callback(err, user);
        });
    }
this.getTrucksByTags = function (words, results, callback1) {
        "use strict";
        var count = 0;
        var finalArray = [];
        results.forEach(function (doc) {
            console.log("Printing document inside results forEach loop " + doc)
            var tagsString = doc.todaysTags;
            console.log("Printing tagString inside results forEach loop " + tagsString);
            var menuString = doc.todaysMenu;
            console.log("Printing tagString inside results forEach loop " + menuString);
            var isTruckAddedOnce = false;
            words.forEach(function (keyword) {
                if (tagsString.indexOf(keyword) > 0 && isTruckAddedOnce == false) {
                    finalArray.push(doc);
                    isTruckAddedOnce = true;
                    console.log("Printing final Array inside for Each " + finalArray);
                }
                else if (menuString.indexOf(keyword) > 0 && isTruckAddedOnce == false) {
                    finalArray.push(doc);
                    isTruckAddedOnce = true;
                    console.log("Printing final Array inside for Each " + finalArray);
                }
                count++;
                console.log("Printing count " + count);
                console.log("Printing count of words" + words.length);
                console.log("Printing count of results" + results.length);
                if (count == (words.length * results.length)) {
                    console.log("Printing  inside the count if loop final Array " + finalArray);
                    callback1(err,finalArray);
                }
            });
            callback1(err,finalArray);
        });
    }


    this.EditProfile = function(userID, WhatILike, Distance,profileImage, callback) {
        
        var userprofileinfo = {$set: {'whatilike': WhatILike, 'Distance': Distance}};
        var query = {_id: userID};

        var data = fs.readFileSync(profileImage.path);
        var image = new MongoDb.Binary(data);
        var imageType = profileImage.type;
        var imageName = profileImage.name;
        
        var userImageInfo = {'_id': userID, 'image': image, 'image_type': imageType, 'image_name': imageName}

        users.update(query, userprofileinfo, function(err, result){
               console.log(image);
            if(profileImage.size != 0){
                console.log("Executing if");

               userImages.save(userImageInfo, function(err, result){ 
                callback(err, userprofileinfo); 
            });
           }
            else {
                console.log("Executing else");
                callback(err, userprofileinfo);
            }
        });
    }
	
	this.truckOwnerEditProfile = function(userID, WhatILike, foodTruckName, whatiserve, aboutMe, operatingHours, profileImage, callback) {
        
        var userprofileinfo = {$set: {'food_truck_name': foodTruckName, 'whatyouserve': whatiserve,'whatilike': WhatILike, 'operating_hours': operatingHours, 'about_me': aboutMe}};
        var query = {_id: userID};

        var data = fs.readFileSync(profileImage.path);
        var image = new MongoDb.Binary(data);
        var imageType = profileImage.type;
        var imageName = profileImage.name;
        
        var userImageInfo = {'_id': userID, 'image': image, 'image_type': imageType, 'image_name': imageName}

        users.update(query, userprofileinfo, function(err, result){
               console.log(image);
            if(profileImage.size != 0){
                console.log("Executing if");

               userImages.save(userImageInfo, function(err, result){ 
                callback(err, userprofileinfo); 
            });
           }
            else {
                console.log("Executing else");
                callback(err, userprofileinfo);
            }
        });
    }
	
	this.addTruckSubscription = function(userID, foodTruckName, callback) {
	users.update({'_id': userID}, {$addToSet: {subscription: foodTruckName}}, {upsert:true}, function(err, result){
		callback(err, result);
		});
	}

    
}

module.exports.UsersDAO = UsersDAO;
