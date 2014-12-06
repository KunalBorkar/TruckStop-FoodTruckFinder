var bcrypt = require('bcrypt-nodejs')
	, MongoDb = require("mongodb")
	, fs = require("fs");

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

    this.addUser = function(firstName, lastName, emailAddress, password, radio, latitude, longitude, callback) {
        "use strict";
        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {'_id': emailAddress, 'firstName': firstName, 'lastName': lastName, 'password': password_hash, 'truckOwner': radio, 'latitude': latitude, 'longitude':longitude};

        // TODO: hw2.3
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
		
		this.addTruckUserProfile = function(userID, foodTruckName, licenseNumber, specialityCuisine, operatingHours, aboutMe, profileImage, callback) {
		
		var truckUserProfileInfo = {$set : {'food_truck_name': foodTruckName, 'license_number': licenseNumber, 'speciality_cuisine': specialityCuisine, 'operating_hours': operatingHours, 'about_me': aboutMe}};
		
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

}

module.exports.UsersDAO = UsersDAO;
