/**
 * 
 *  MySql adapter 
 * 
 */
const config_mysql = require('../config/appConfig.json')['mysql']
const config_createtables = require('../config/appConfig.json')['tabledefinitions']
const config_readtables = require('../config/appConfig.json')['fetchtables']

var mysql      = require('mysql');

dbconnection = mysql.createConnection({
  host     : `${config_mysql.host}`,
  port     : `${config_mysql.port}`,
  user     : `${config_mysql.user}`,
  password : `${config_mysql.password}`
});

var dbname = `${config_mysql.database}`;
var dbstep = 0;
var profiles, tickers;
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
	case 1: /* Select the mybroker DB */
		console.log('-----------Entering STEP '+step)
		connection.changeUser({database : dbname}, function (err, result) {
		    if (err) {
		    	 console.log('Error selecting the database: ' + err.message);
		    	 console.log ('...will try to create the database.');
		    	 dbstep = 2;
				 dbload(dbstep,connection);
		    } else {
		    	 console.log("Connected to database "+ dbname + "; proceed to read tables.");
		    	 dbstep = 3.1;
		    	 dbload(dbstep,connection);
		    }
		    });
		break;
	case 2: /* Create the DB, assuming it's a new installation */
		console.log('-----------Entering STEP '+step)
		console.log('recreate the sql server connection')
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
		    	 console.log(dbname + " database created successfully; proceed to select DB.");
		    	 dbstep = 1;
		    	 dbload(dbstep,dbconnection);
		    }
		  });
		break;
	case 3.1: /* Read table profile */
		console.log('-----------Entering STEP '+step)
		console.log("Read PROFILE table.");
		connection.query(`${config_readtables.profile}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error reading table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	profiles = results;
		    	console.log(profiles);
		    	dbstep = 3.2;
		   		dbload(dbstep,connection);
		    }
		   });
		break;		
	case 3.2: /* Read table tickers */
		console.log('-----------Entering STEP '+step)
		console.log("Read TICKER table.");
		connection.query(`${config_readtables.ticker}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error reading table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	tickers = results;
		        dbready = true;
		    	console.log("DATABASE READY - TICKERS and PROFILES are loaded:");
		    	console.log("--- PROFILES --- \n"+ JSON.stringify(profiles, null, ' '));
		    	console.log("--- TICKERS --- \n"+ JSON.stringify(tickers, null, ' '));
		/*    	console.log(tickers[1].exchange); */
		    }
		   });
		break;		

/*		break; */
	case 4.1: /* Create Table Profile */
		console.log('-----------Entering STEP '+step)
		console.log("Create PROFILES table: " + `${config_createtables.profile}`);
		connection.query(`${config_createtables.profile}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.2;
		   		dbload(dbstep,connection);
		    }
		   });
		break;
	case 4.2: /* Create Table Ticker */
		console.log('-----------Entering STEP '+step)
		console.log("Create TICKERS table: " + `${config_createtables.ticker}`);
		connection.query(`${config_createtables.ticker}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.3;
		   		dbload(dbstep,connection);
		    }
		   });
		break;
	case 4.3: /* Create Table User */
		console.log('-----------Entering STEP '+step)
		console.log("Create USERS table: " + `${config_createtables.user}`);
		connection.query(`${config_createtables.user}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.4;
		   		dbload(dbstep,connection);
		    }
		   });
		break;
	case 4.4: /* Create Table Account */
		console.log('-----------Entering STEP '+step)
		console.log("Create ACCOUNTS table: " + `${config_createtables.account}`);
		connection.query(`${config_createtables.account}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.5;
		   		dbload(dbstep,connection);
		    }
		   });
		break;
	case 4.5: /* Create Table Account */
		console.log('-----------Entering STEP '+step)
		console.log("Create TRANSACTIONLOGS table: " + `${config_createtables.transactionlog}`);
		connection.query(`${config_createtables.transactionlog}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		        dbready = true;
		    	console.log("DATABASE READY - TICKERS AND PROFILES TABLES ARE EMPTY");
		    }
		   });
		break;
	} /* end switch */
		
}

dbload(dbstep,dbconnection); 
exports.dbconnection=dbconnection;

