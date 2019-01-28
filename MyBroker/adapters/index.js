/**
 * 
 *  MySql adapter 
 * 
 */
const config_mysql = require('../config/appConfig.json')['mysql']
var mysql      = require('mysql');
dbconnection = mysql.createConnection({
  host     : `${config_mysql.host}`,
  port     : `${config_mysql.port}`,
  user     : `${config_mysql.user}`,
  password : `${config_mysql.password}`
});

var dbname = `${config_mysql.database}`;
var dbstep = 0;
var dbready = false;
 
/** dbstep : basically odd is good, even is bad
 *  0 = Initiate mysql connection 
 *  1 = Connect to database
 *  2 = Create Database if DB connection fails
 *  3 = Read tables
 *  4 = Create tables
 *  */


function dbload(step,connection) {
	switch(step) {
	case 0: /* Connect to mysql server */
		connection.connect(function(err) {
			console.log('-----------Entering STEP '+step)
			  if (err) {
				    console.error('Error connecting to db server: ' + err.message);
				    console.error('... go troubleshoot the db server connection yourself');
				    
		      } else { 
		    	  	console.log('Connected to db server as id ' + connection.threadId);
		    	  	dbstep = 1;
		    	  	dbload(dbstep,connection);
		      }
		      });
		break;
	case 1: /* Connect to DB */
		console.log('-----------Entering STEP '+step)
		connection.changeUser({database : dbname}, function (err, result) {
		    if (err) {
		    	 console.log('Error connecting to database: ' + err.message);
		    	 console.log ('...will try to create the database.');
		    	 dbstep = 2;
				 dbload(dbstep,connection);
		    } else {
		    	 console.log("Connected to database "+ dbname + "; proceed to read tables.");
		    	 dbstep = 3;
		    	 dbload(dbstep,connection);
		    }
		    });
		break;
	case 2: /* Create to DB, assuming it's a new installation */
		console.log('-----------Entering STEP '+step)
		console.log('recreate the sql server connection before')
		dbconnection = mysql.createConnection({
						host     : `${config_mysql.host}`,
						port     : `${config_mysql.port}`,
						user     : `${config_mysql.user}`,
						password : `${config_mysql.password}`
		});
		dbconnection.query("CREATE DATABASE "+dbname, function (err, result) {
		    if (err) {
		    	 console.error('Error creating DB: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	 console.log("Created "+ dbname + "; proceed to create tables.");
		    	 dbstep = 4;
		    	 dbload(dbstep,dbconnection);
		    }
		  });
		break;
	case 3: /* Read tables */
		console.log('-----------Entering STEP '+step)
		console.log("Read tables.");
		break;
	case 4: /* Create Tables */
		console.log('-----------Entering STEP '+step)
		console.log("Create tables.");
		dbstep = 3;
		dbload(dbstep,dbconnection);
		break;
	} /* end switch */
		
}

dbload(dbstep,dbconnection); /* initiate the DB loading or creation if needed */

/* dbconnection.connect(function(err) {
	  if (err) {
		    console.error('error connecting: ' + err.stack);
		    return;
		  }
		 
		  console.log('connected as id ' + connection.threadId);
		});
*/
exports.dbconnection=dbconnection;

