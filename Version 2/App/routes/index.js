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
	
	app.get('/serveToday', contentHandler.displayServeTodayPage);
	app.post('/serveToday', sessionHandler.serveToday);

    app.get("/userDashboard", contentHandler.displayUserDashboardPage);
	app.post("/userDashboard", sessionHandler.searchTrucksForUser);

	app.get("/subscriptions", contentHandler.displaySubscriptionPage);
	app.post("/subscriptions", sessionHandler.displayUnsuscribePage);
	
	app.get("/searchFoodTrucks", contentHandler.displaySearchPage);
	
	app.get('/foodtruck/:foodTruckName', contentHandler.displayFoodtruck);
	
	app.get('/foodtruck/img/:userID', contentHandler.displayImage);

    app.use(ErrorHandler);
}
