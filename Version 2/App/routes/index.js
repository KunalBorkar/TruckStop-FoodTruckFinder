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

    // The main page of the blog, filtered by tag
//    app.get('/tag/:tag', contentHandler.displayMainPageByTag);

    // A single post, which can be commented on
//    app.get("/post/:permalink", contentHandler.displayPostByPermalink);
//    app.post('/newcomment', contentHandler.handleNewComment);
//    app.get("/post_not_found", contentHandler.displayPostNotFound);

    // Displays the form allowing a user to add a new post. Only works for logged in users
  //  app.get('/newpost', contentHandler.displayNewPostPage);
   // app.post('/newpost', contentHandler.handleNewPost);

    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.displayWelcome);

    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Welcome page
    app.get("/welcome", sessionHandler.displayWelcomePage);

    app.get("/trucksignup",contentHandler.displayTruckSignupPage);
	app.post("/trucksignup",sessionHandler.displayDashboard);
	
	app.get("/truckUserDashboard", contentHandler.displayTruckUserDashboardPage);

    app.get('/GenUserProfile', contentHandler.displayProfile);
    app.get('/EditPRofile', contentHandler.displayEditProfilePage);
    app.post('/EditPRofile', sessionHandler.EditProfile);
	//app.post("/truckUserDashboard", );
	

    // Error handling middleware
    app.use(ErrorHandler);
}
