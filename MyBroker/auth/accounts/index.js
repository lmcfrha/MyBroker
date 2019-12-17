/**
 * 
 *  Accounts module - Sub App
 * 
 */
var express = require('express');
var path = require('path');
var adminUtils = require('../adminutils');


var app = module.exports = express();
//config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use('/rebalance', rebalance);

app.post('/:user', function(req, res) {
	  console.log(req.body);
	  let owner = req.body.owner;
	  let profiles = req.body.profiles;
	  let orderType = req.body.orderType;
	  let accountNickname = req.body.accountNickname;
	  let type = req.body.type;
      let creationDate = req.body.creationDate;
      let profilesDescriptor = [];
// now retrieve the Profiles:
      let profilesContentP = profiles.map( profilename=>adminUtils.retrieveProfileContent(profilename,null));
      Promise.all(profilesContentP)
      .then((results)=>{
    	  profilesDescriptor = results;
    	  console.log(profilesDescriptor);
    	  // Start Tx to begin updating the DB
    	  return adapters.mySqlPromiseTx();
          })
      .then((result)=>{
    	 console.log(result);
    	 var sql1 = "INSERT INTO account (username, nickname, creationdate) VALUES (?,?,NOW())";
    	 var inserts1 = [owner, accountNickname];
    	 sql1 = mysql.format(sql1,inserts1);
    	 return adapters.mySqlPromise(sql1);
    	  })
      .then((result)=>{
    	 console.log(result);
    	 let noProfiles = profilesDescriptor.length; 
    	 let insertsPromises = [];
    	 for (var i = 0; i < noProfiles; i++) {
    		 let profileContent = profilesDescriptor[i];
    		 let noTickers = profileContent.length;
    		 for (var j = 0; j < noTickers; j++) {
    			 let sqln = "INSERT INTO accountrecord VALUES (?,?,LAST_INSERT_ID(),?,0)";
    			 let insert = [profileContent[j].symbol,profileContent[j].exchange,profileContent[j].profilename];
    			 sqln = mysql.format(sqln,insert);
    			 insertsPromises.push(adapters.mySqlPromise(sqln));
    		 }
    	 }
    	 return Promise.all(insertsPromises);
      })
      .then((result)=>{
    	   console.log(result);
    	   return adapters.mySqlPromiseCommit();
       })
      .then((result)=>{console.log(result);})
      .catch((error)=>{
    	  console.log("Error during Tx : "+error+ "- Attempting Rollback...");
    	  return adapters.mySqlPromiseRollback();
          })
      .then((result)=>{console.log(result)},(reject)=>{console.log("!! ROLLBACK OPERATION FAILED !!"+reject)});
    	 
	  res.send("Account added to "+owner);

});

function addUserAccount(owner, accountNickname, type, profiles, creationDate) {
	console.log(profiles);
	console.log(owner);
}

function rebalance(req,res) {
       console.log(req.body.profile);
// Get the profile definition and all the accounts that have this profile
// SELECT * FROM mybroker.ticker where profilename = 'HANSLIK' order by symbol,exchange;
// SELECT * FROM mybroker.account where profilename = 'CATHY' order by username,symbol,exchange;
// For each of the account, calculate rebalancing orders
// 
// For each of the account, prepare the rebalancing object.
// Return the table of rebalancing objects
 	  var sql = "SELECT * FROM ticker WHERE profilename = ? ORDER BY symbol,exchange;";
 	  var sql2 = "SELECT * FROM account WHERE profilename = ? order by username,symbol,exchange;";
	  var inserts = [req.body.profile];	
	  sql = mysql.format(sql,inserts);
	  sql2 = mysql.format(sql2,inserts);
	  console.log(sql);

// Initialize the rebalance object
	  var currentdate = new Date(); 
	  var rebalance = {};
	  rebalance.profilename = req.body.profile;
	  rebalance.datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth()+1)  + "/" 
      + currentdate.getFullYear() + " @ "  
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();
	  rebalance.profile = []
	  
	  mySqlPromise(sql,adapters)
	  .then((result)=>{
		  console.log(result);
		  for (i = 0; i < result.length; i++) { 
			  var stock = new Object();
			  stock[result[i].symbol]=result[i].target;
			  stock["exch"]=result[i].exchange;
			  rebalance.profile[i]=stock;
		  }
		  return mySqlPromise(sql2,adapters)
		  })
	  .then((result)=>{
		  console.log(result);
		  var map = new Map();
		  for (i = 0; i < result.length; i++) { 
			  var key = result[i].accountid;
			  var stocklist = [];
			  if ( map.get(key) != undefined ) {
                 stocklist = map.get(key);
			  }
			  var stock = new Object();
		      stock.symbol = result[i].symbol;
		      stock.exchange =result[i].exchange;
		      stock.units = result[i].units;
		      stock.quote = quotesTape[stock.symbol];
			  stocklist.push(stock);
		      map.set(key,stocklist);
		  }
		  console.log(map);

		  console.log(rebalance);
		  })
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;


// add at the end of the processing of the rebalance to close the middleware 
          res.json(req.body);
}   // End of rebalance 



