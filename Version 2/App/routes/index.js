var SessionHandler = require('./session')
  , ContentHandler = require('./content')
  , ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);

    // Middleware to see if a user is logged in
    app.use(sessionHandler.isLoggedInMiddleware);

    // The main page of the blog
    app.get('/', contentHandler.displayMainPage);
	app.post('/', sessionHandler.displayWelcome);
    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.displayWelcome);

    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Welcome page
    app.get("/welcome", sessionHandler.displayWelcomePage);

    app.get("/truckOwnerSignUp",contentHandler.displayTruckSignupPage);
	app.post("/truckOwnerSignUp",sessionHandler.displayTruckOwnerDashboard);
	
	app.get("/truckOwnerDashboard", contentHandler.displayTruckOwnerDashboardPage);
	//app.post("/truckUserDashboard", contentHandler.displayServeTodayPage);

    app.get('/userProfile', contentHandler.displayProfile);
    app.get('/userProfile/img/:userId', contentHandler.showImage);
    
    app.get('/userEditPRofile', contentHandler.displayEditProfilePage);
    app.post('/userEditPRofile', sessionHandler.EditProfile);
	
	app.get('/truckOwnerEditProfile', contentHandler.displaytruckOwnerProfilePage);
	app.post('/truckOwnerEditProfile',sessionHandler.truckOwnerEditProfile);
	
	app.get('/truckOwnerProfile', contentHandler.displayTruckOwnerProfile);
    app.get('/truckOwnerProfile/img/:userId', contentHandler.showImage);
	
	app.get('/truckOwnerServeToday', contentHandler.displayServeTodayPage);
	app.post('/truckOwnerServeToday', sessionHandler.serveToday);

    app.get("/userDashboard", contentHandler.displayUserDashboardPage);
	app.post("/userDashboard", sessionHandler.searchTrucksForUser);

	app.get("/userSubscriptions", contentHandler.displayUserSubscriptionPage);
	app.post("/userSubscriptions", sessionHandler.displayUnsuscribePageForUser);
	
	app.get("/truckOwnerSubscriptions", contentHandler.displayTruckOwnerSubscriptionPage);
	app.post("/truckOwnerSubscriptions", sessionHandler.displayUnsuscribePageForTruckOwner);
	
	app.post("/subscribe", contentHandler.displayRedirection);
	
	app.post("/home", contentHandler.displayHomeScreen);
	
	app.get("/searchFoodTrucks", contentHandler.displaySearchPage);
	
	app.get('/foodtruck/:foodTruckName', contentHandler.displayFoodtruck);
	
	app.get('/foodtruck/img/:userID', contentHandler.displayImage);

    app.use(ErrorHandler);
}
