/**
 * 
 *  MySql adapter 
 * 
 */
const config_mysql = require('../config/appConfig.json')['mysql']
const config_createtables = require('../config/appConfig.json')['tabledefinitions']
const config_readtables = require('../config/appConfig.json')['fetchtables']

var mysql      = require('mysql');

var dbconnection = mysql.createConnection({
  host     : `${config_mysql.host}`,
  port     : `${config_mysql.port}`,
  user     : `${config_mysql.user}`,
  password : `${config_mysql.password}`
});

var dbname = `${config_mysql.database}`;
var dbstep = 0;
exports.profiles = {}; 
exports.tickers = {};
var dbready = false;
 
/** dbstep : basically odd is good, even is bad
 *  0 = Initiate mysql connection 
 *  1 = Connect to database
 *  2 = Create Database if DB connection fails
 *  3 = Read tables
 *  4 = Create tables
 *  */


function dbload(step) {
	switch(step) {
	case 0: /* Connect to mysql server */
		dbconnection.connect(function(err) {
			console.log('-----------Entering STEP '+step)
			  if (err) {
				    console.error('Error connecting to db server: ' + err.message);
				    console.error('... go troubleshoot the db server connection yourself');
				    
		      } else { 
		    	  	console.log('Connected to db server as id ' + dbconnection.threadId);
		    	  	dbstep = 1;
		    	  	dbload(dbstep);
		      }
		      });
		break;
	case 1: /* Select the mybroker DB */
		console.log('-----------Entering STEP '+step)
		dbconnection.changeUser({database : dbname}, function (err, result) {
		    if (err) {
		    	 console.log('Error selecting the database: ' + err.message);
		    	 console.log ('...will try to create the database.');
		    	 dbstep = 2;
				 dbload(dbstep);
		    } else {
		    	 console.log("Connected to database "+ dbname + "; proceed to read tables.");
		    	 dbstep = 3.1;
		    	 dbload(dbstep);
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
		    	 dbload(dbstep);
		    }
		  });
		break;
	case 3.1: /* Read table profile */
		console.log('-----------Entering STEP '+step)
		console.log("Read PROFILE table.");
		dbconnection.query(`${config_readtables.profile}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error reading table: ' + err.message);
		    	 console.log ('...assuming the DB has been dropped - recreating from scratch.');
		    	 dbstep = 4.1;
		    	 dbload(dbstep);
		    } else {
		    	exports.profiles = results;
		    	console.log(exports.profiles);
		    	dbstep = 3.2;
		   		dbload(dbstep);
		    }
		   });
		break;		
	case 3.2: /* Read table tickers */
		console.log('-----------Entering STEP '+step)
		console.log("Read TICKER table.");
		dbconnection.query(`${config_readtables.ticker}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error reading table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	exports.tickers = results;
		    	console.log(exports.tickers);
		        dbready = true;
		    	console.log("DATABASE READY - TICKERS and PROFILES are loaded:");
		    	console.log("--- PROFILES --- \n"+ JSON.stringify(exports.profiles, null, ' '));
		    	console.log("--- TICKERS --- \n"+ JSON.stringify(exports.tickers, null, ' '));
		/*    	console.log(tickers[1].exchange); */
		    }
		   });
		break;		

/*		break; */
	case 4.1: /* Create Table Profile */
		console.log('-----------Entering STEP '+step)
		console.log("Create PROFILES table: " + `${config_createtables.profile}`);
		dbconnection.query(`${config_createtables.profile}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.2;
		   		dbload(dbstep);
		    }
		   });
		break;
	case 4.2: /* Create Table Ticker */
		console.log('-----------Entering STEP '+step)
		console.log("Create TICKERS table: " + `${config_createtables.ticker}`);
		dbconnection.query(`${config_createtables.ticker}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.3;
		   		dbload(dbstep);
		    }
		   });
		break;
	case 4.3: /* Create Table User */
		console.log('-----------Entering STEP '+step)
		console.log("Create USERS table: " + `${config_createtables.user}`);
		dbconnection.query(`${config_createtables.user}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.4;
		   		dbload(dbstep);
		    }
		   });
		break;
	case 4.4: /* Create Table Account */
		console.log('-----------Entering STEP '+step)
		console.log("Create ACCOUNTS table: " + `${config_createtables.account}`);
		dbconnection.query(`${config_createtables.account}`, function (err, results, fields) {
			  // error will be an Error if one occurred during the query
			  // results will contain the results of the query
			  // fields will contain information about the returned results fields (if any)
		    if (err) {
		    	 console.error('Error creating table: ' + err.message);
		    	 console.log ('...go troubleshoot yourself.');
		    } else {
		    	dbstep = 4.5;
		   		dbload(dbstep);
		    }
		   });
		break;
	case 4.5: /* Create Table Account */
		console.log('-----------Entering STEP '+step)
		console.log("Create TRANSACTIONLOGS table: " + `${config_createtables.transactionlog}`);
		dbconnection.query(`${config_createtables.transactionlog}`, function (err, results, fields) {
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

dbload(dbstep);  /* create or read the DB tables */ 
exports.dbconnection=dbconnection; /* Keep the dbconnection and make it available */


/**
 * 
 *  Alphavantage finance adapter 
 * 
 */
const config_financeapi = require('../config/appConfig.json')['financeapi'];
const reqPromise = require('request-promise-native');
cheerio = require('cheerio') /* Used as jQuery but server side: will be used to parse the TSX response */ 

quotesTape = {};

/**
 * Function returns a Promise to retrieve the list of stock symbols from the database
 */
getQuoteListP = (dbCon, tickerTable, symbolCol, exchCol) => new Promise( (resolve, reject) => {
	dbCon.query("SELECT DISTINCT "+symbolCol+", "+exchCol+" FROM "+tickerTable+" WHERE "+symbolCol+" <> 'CASH'", function (err, results) {
	    if (err) {
	    	 console.error('Error getting tickers from table: ' + err.message);
	    	 console.log ('...go troubleshoot yourself.');
	    	 reject(err);
	    } else {
	    	resolve(results);
	    }
    })
   });

/**
 * Function returns a Promise (all) to get all the current stock prices 
 */
getQuotesP = (quotes) => {
	promiseQuoteArray = quotes.map( (quote) => {
		var url = `${config_financeapi.endpoint}`+quote.symbol;
//		var reqPromise = require('request-promise-native');
		return reqPromise(url);
	} );
	var bigPromise = Promise.all(promiseQuoteArray);
	return bigPromise;
}

/**
 * Function executes the promise chain:
 * - getQuoteListP: retrieve all the tickers from the DB
 * - get all the values from a Stock service API
 * - build the JSon object with all the stock quotes 
 */
function quotesTapeP(dbCon, tickerTable, symbolCol, exchCol) {
	getQuoteListP(dbCon, tickerTable, symbolCol, exchCol)
	.then ( (quotes) => {return getQuotesP(quotes)} )
	.then ( (quotes) => {
		var i;
/*
 * Extract from the yahoo response, the stock quote using the cheerio
 */
		for (i = 0; i < quotes.length; i++) { 
			const $ = cheerio.load(quotes[i]);
			/* Man those capitalist piglets, changing the format to make me work for nothing... */
			var price = $(".price span").text();
			$(".price").remove();
			quotesTape[$(".labs-symbol").html().trim()]= price;
		    }
		console.log(JSON.stringify(quotesTape))},
	        (reason) => {console.log("CESTMOIIIIII "+reason+quotes);})
	.catch (function(err) {console.log("COUCOUUUU"+err);for (i=0;i<quotes.length;i++) {quotesTape[quotes[i]]=55;}});
}

/* Set the periodic execution of quotes retrieval from TSX, updating the quotesTape table and printing to consolelogs */
var interval = setInterval(quotesTapeP,`${config_financeapi.refresh}`,dbconnection,"ticker","symbol","exchange");

var mySqlPromise = function (sql) {
	/*	This function should be called to obtain a promise for the sql query arg.
	 *  The sql query should be prepared as follows (example insert statement):
	 *  var sql = "INSERT INTO user values (?,?,?,?,?,?,?,?,NOW());"
	 *	var inserts = [u,f,l,salt,hash,e,'S','T'];
	 *	sql = mysql.format(sql,inserts);
	 *
	*/
		return new Promise(function(resolve,reject) {
			dbconnection.query(sql, (error, results, fields) => 
			{
				if (error) return reject(error);
				resolve(results);
			} )
		}) 
	}
exports.mySqlPromise=mySqlPromise;