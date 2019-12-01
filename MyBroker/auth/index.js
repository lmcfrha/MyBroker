/**
 * Module dependencies.
 */

var express = require('express');
var hash = require('pbkdf2-password')({ saltLength: 5})
var path = require('path');
var session = require('express-session');
mysql      = require('mysql');

var accounts = require('../accounts');

/* Session store business... */
var MySQLStore = require('express-mysql-session')(session);
const config_mysql = require('../config/appConfig.json')['mysql']
const config_financeapi = require('../config/appConfig.json')['financeapi'];
var options = {
	  host     : `${config_mysql.host}`,
	  port     : `${config_mysql.port}`,
	  user     : `${config_mysql.user}`,
	  password : `${config_mysql.password}`,
      database : `${config_mysql.database}`
	};
var sessionStore = new MySQLStore(options);
/* End session store setup */
var app = module.exports = express();

// config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(express.urlencoded({ extended: false }))
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret',
  store: sessionStore,
}));

// Session-persisted message middleware

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

/**
 * createUser returns the hash call back function, parameterized with the info submitted in the form
 * (req form parameters) so it all can be used to update the user table 
 * in the DB
 *  
 **/
var createUser = (u,f,l,e,s,t) => { return function (err, pass, salt, hash) {
	  if (err) throw err;
	  // store the salt & hash in the "db"
	  var sql = "INSERT INTO user values (?,?,?,?,?,?,?,?,NOW());"
	  var inserts = [u,f,l,salt,hash,e,'S','T'];
	  sql = mysql.format(sql,inserts);
	  adapters.dbconnection.query(sql,function (error, results, fields) {
		  if (error) throw error;
		  // ...
		});
	  console.log("user insert order");
	};	  }


// Authenticate using database

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  // Fetch user row from user table
  var sql = "SELECT * FROM user where username=? ;"
  var inserts = [name];
  sql = mysql.format(sql,inserts);
  adapters.dbconnection.query(sql,function (error, results, fields) {
  // Make the hash calculation with password entered - verify and call fn according to the result
	if (error) throw error;
	console.log(results[0].lastname);
	hash({ password: pass, salt: results[0].salt }, function (err, pass, salt, hash) {
			    if (err) return fn(err);
			    if (hash === results[0].hash) return fn(null, results[0])
			    fn(new Error('invalid password'));
			  });
		  // ...
		});
 
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('../login');
  }
}
function roleAdmin(req, res, next) {
	  if (req.session.user != 'admin') {
		  res.status(401).send('Unauthorized Access yada yada');
	  } else {
	    next();
	  }
}

app.get('/', function(req, res){
  res.redirect('./login');
});

app.get('/restricted', restrict, function(req, res){
  res.send('Wahoo! restricted area, click to <a href="logout">logout</a>');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/register', function(req, res){
	  res.render('register');
});

 app.get('/admin/profiles', roleAdmin, function(req, res){
    // Retrieve profiles
	  var sql = "SELECT * FROM profile;";
	  console.log(sql);
	  mySqlPromise(sql,adapters)
	  .then((result)=>{console.log("Profile list:");console.log(result);res.send(result);} )
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
});

app.get('/admin/profile', roleAdmin, function(req, res){
    // Retrieve profiles
	  var sql = "SELECT * FROM ticker, profile where profile.profilename='"+req.query.name+"' and ticker.profilename='"+req.query.name+"'";
	  console.log(sql);
	  mySqlPromise(sql,adapters)
	  .then((result)=>{console.log("Profile definition:");console.log(result);res.send(result);} )
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
});
app.put('/admin/profile', roleAdmin, function(req, res){
    // Called when a modified profile is Saved.

	  var i;
	  for (i=0; i < req.body.stocks.length; i++) {
		  sql = "INSERT INTO ticker (symbol,target,exchange,profilename) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE target = ?;";
		  inserts = [req.body.stocks[i].Ticker, req.body.stocks[i]['Target %'], req.body.stocks[i]['Exch.'], req.body.name, req.body.stocks[i]['Target %']];
		  sql = mysql.format(sql,inserts);
		  console.log(sql);
		  mySqlPromise(sql,adapters)
		  .then((result)=>{console.log("Ticker Affected Rows:");console.log(result.affectedRows)},
				(error)=>{console.log("Ticker oooops");console.log(error.code)})
		  .catch(function() { console.log( "Ticker something went wrong!" ) }) ;
	  }	  
	  res.json(req.body);
	  // res.redirect('../');
});

app.delete('/admin/profile/:profilename', roleAdmin, function(req, res){
    // Called when a profile is deleted.
	  // Check if profile is used.
	  // If not used, delete profile
	  // If used, set the targets to 0
	  // Profile will be removed at the next portfolio rebalance.

	// Update in the ticker table:
//		  var sql = 'SELECT count(*) from account where profilename=?';
	      var sql = 'SELECT username,accountid from account where profilename=?';
		  var inserts = [`${req.params.profilename}`];
		  var message;
		  sql = mysql.format(sql,inserts);
		  console.log(sql);
		  mySqlPromise(sql,adapters)
//		  .then((result)=>{var key = Object.keys(result[0])[0];console.log("Number of accounts using the profile: "+result[0][key])},
		  .then((result)=>{
			        var length = result.length;
			        console.log("Number of accounts using the profile: "+length);
			        if ( length === 0 )
			        	{
			        	var sqldelete = 'DELETE FROM profile WHERE profilename=?';
 			  		    sqldelete = mysql.format(sqldelete,inserts);
 			  		    console.log(sqldelete);
 			  		    message = inserts + " DELETED.";
 			 		    return mySqlPromise(sqldelete,adapters);
			        	}
			        else {
			        	var sqlupdate = 'UPDATE ticker SET target=0 WHERE profilename=?';
			        	sqlupdate = mysql.format(sqlupdate,inserts);
			        	console.log(sqlupdate);
 			  		    message = inserts+" used in "+length+" accounts. PROFILE TARGETS ARE RESET TO 0. "+inserts+" will be deleted after next rebalance.";
 			  		    return mySqlPromise(sqlupdate,adapters);
			            }
			        },
				(error)=>{console.log("Delete oooops");console.log(error.code)})
		  .catch(function() { message = "Screwed something went wrong!"  }) 
		  .finally (function() {console.log(message);res.json(message);});
	  
	  // res.redirect('../');
});


app.get('/admin', roleAdmin, function(req, res){
	  res.render('admin/adminconsole');
});

app.post('/admin/profile', roleAdmin, function(req,res){
      // Called when a (new) profile is Saved.
	  // Update the DB: Tickers, Profiles
	  // Add new tickers to ticker feed
	
	// Save the new profile in the profile table:
	  var sql = "INSERT INTO profile VALUES (?,?);";
	  var inserts = [req.body.name,req.body.risk];	
	  sql = mysql.format(sql,inserts);
	  console.log(sql);
	  mySqlPromise(sql,adapters)
	  .then((result)=>{console.log("yeaaaaa Affected Rows:");console.log(result)} )
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
    
	// Save new symbols in the ticker table:
	  var i;
	  for (i=0; i < req.body.stocks.length; i++) {
		  sql = "INSERT INTO ticker VALUES (?,?,?,?);";
		  inserts = [req.body.stocks[i].Ticker, req.body.stocks[i]['Target %'], req.body.stocks[i]['Exch.'], req.body.name];
		  sql = mysql.format(sql,inserts);
		  console.log(sql);
		  mySqlPromise(sql,adapters)
		  .then((result)=>{console.log("Ticker Affected Rows:");console.log(result.affectedRows)},
				(error)=>{console.log("Ticker oooops");console.log(error.code)})
		  .catch(function() { console.log( "Ticker something went wrong!" ) }) ;
	  }	  
	  res.json(req.body);
	  // res.redirect('../');
});

// Finally a clean call to module which defines the accounts object which 
// contains the rebalance function definition
app.post('/admin/rebalance', roleAdmin, accounts.rebalance);

app.post('/register', function(req, res){
	console.log(req)
	hash({ password: req.body.password }, createUser(req.body.username,
			req.body.firstname,
			req.body.lastname,
			req.body.email,
			'on verra','plus tard'));	  
	  res.send('congrats');
});
app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user.username;
        req.session.success = 'Authenticated as ' + user.firstname + ' ' +user.lastname 
          +  ' click to <a href="logout">logout</a>. '
          + ' You may now access <a href="admin">the admin console</a>.';
        res.redirect('back');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('back');
    }
  });
});

app.get('/feed/tickers', function(req, res){
	  req.socket.setTimeout(Number.MAX_SAFE_INTEGER);
	  var messageCount = 0;
	  setInterval( () => {
		    messageCount++; // Increment our message count

		    res.write('id: ' + messageCount + '\n');
		    res.write("data: " + JSON.stringify(quotesTape) + '\n\n'); // Note the extra newline
	  }, `${config_financeapi.refresh}`)
	 //send headers for event-stream connection
	  res.writeHead(200, {
	    'Content-Type': 'text/event-stream',
	    'Cache-Control': 'no-cache',
	    'Connection': 'keep-alive'
	  });
	  res.write('\n');
	
});


/* Promise for DB operations */
mySqlPromise = function (sql,adapters) {
/*	This function should be called to obtain a promise for the sql query arg.
 *  The sql query should be prepared as follows (example insert statement):
 *  var sql = "INSERT INTO user values (?,?,?,?,?,?,?,?,NOW());"
 *	var inserts = [u,f,l,salt,hash,e,'S','T'];
 *	sql = mysql.format(sql,inserts);
 *
*/
	return new Promise(function(resolve,reject) {
		adapters.dbconnection.query(sql, (error, results, fields) => 
		{
			if (error) return reject(error);
			resolve(results);
		} )
	}) 
}


/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}