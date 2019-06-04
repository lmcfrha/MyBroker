

MyBroker
========



## Usage



## Development
Based on:
- [http://expressjs.com](http://expressjs.com) framework
- session store [express-mysql-session](https://www.npmjs.com/package/express-mysql-session)
- [Server side events information](https://stackoverflow.com/questions/11077857/what-are-long-polling-websockets-server-sent-events-sse-and-comet)
[sse example](https://tomkersten.com/articles/server-sent-events-with-node/)
- Database Design:
[https://app.sqldbm.com/MySQL/Edit/p54183/](https://app.sqldbm.com/MySQL/Edit/p54183/)

Using (not anymore - getting stocks from TSX directly...) stock quotes from Alphavantage. Example:
[https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSX:ALA&apikey=MCAF9B429I44328U](https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSX:ALA&apikey=MCAF9B429I44328U)


{
    "Global Quote": {
        "01. symbol": "TSX:ALA",
        "02. open": "13.8400",
        "03. high": "13.8500",
        "04. low": "13.4000",
        "05. price": "13.5500",
        "06. volume": "1213500",
        "07. latest trading day": "2019-01-24",
        "08. previous close": "13.9500",
        "09. change": "-0.4000",
        "10. change percent": "-2.8674%"
    }
}

## Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
 

Nodeclipse is free open-source project that grows with your contributions.

# Architecture

## app.js
This is the application main module.
- loads the adapters module (./adapters): <br>
	- loads the database config from config/appConfig.json;<br>
	- creates the mysql connection (dbconnection); initialize the DB if needed;<br>
	- loads request-promise-native (simplified HTTP request) and cheerio (jQuery for NodeJS);<br> 
	- setup a periodic task to retrieve all the stock prices, store them in a (global) Json object <em>quotesTape</em> and print them on the console.<br> 
- sets up the express app.<br>
- waits 5 sec before printing a list of the tickers and the profiles read from the database (this is the signal that everything is up and running).

## express app organization
Once the express app is created:
- set the app settings (where are the views to render, using which rendering engine, on what port to listen....)
- setup the middleware stack: favicon, logger, parser, root for serving static files (./public) 
- mount the sub apps:

	1. express app utils mounted on /mybroker/utils/		
	2. express app auth mounted on /mybroker

## Sub app _utils_ /mybroker/utils
- GET /stocks/<symbol>: to retrieve a stock quote (uses the adapters' getQuotesP promise)


## Sub app _auth_  /mybroker
- Add the __session__ middleware express-mysql-session.
- Add middleware to display session error and messages.
- __createUser__ function definition: createUser returns the hash call back function, parameterized with the info submitted in the form (req form parameters) so it all can be used to update the user table in the DB.
- __authenticate__ function definition: for authentication, retrieve the hash + salt based on user from the database. Use the password submitted to calculate the hash (use retrieved salt). If hash matches the one stored in DB, call the callback function submitted in authenticate.
- __restrict__ function definition: the restrict middleware function checks if there's a user defined for the session. If not, redirects to login. 
- __roleAdmin__ function definition: the roleAdmin middleware function checks if the session user is admin. If not, it sends back 401.
- __mySqlPromise__ promise definition: this is the promise for executing an SQL command on the DB

Then some routing:  <br> 
- GET /: redirects to /login<br>
- GET /restricted: for testing restricted access...<br>
- GET /logout: destroys session and redirect to / <br> 
- GET /login: renders login view<br>
- GET /register: renders register view<br>
- GET /admin: renders admin/adminconsole after verifying the user in the session is <em>admin</em>.<br>
- GET __/admin/profiles__: returns the list of profiles (need to be admin) so the admin console can display in a table.</br>
- POST __/admin/profile__: called when a (new) profile is Saved. Updates the DB: Tickers, Profiles. Add new tickers to ticker feed. Save the new profile in the profile table.<br>
- POST __/register__: reads the posted data when creating a user and calculates hash with  createUser invoked to set the hash function callback which will save the new user to the DB<br>
- POST __/login__: uses calls authenticate function to check the password and store in the session the user and the success message if authentication succeeds or err message if authentication fails.Then it redirects to 'back' (an alias for req.get('Referrer'))<br>
- GET __/feed/tickers__: this is where client initiates the event stream. Stream sends periodically (every ${config_financeapi.refresh} sec), the <em>quotesTape</em> Json object (refers to Adapter module to see how quotesTape is build).





