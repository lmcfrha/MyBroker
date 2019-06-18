/**
 * 
 *  Rebalance module 
 * 
 */
var accounts = {
	rebalance: function(req,res) {
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
		  
		  console.log(rebalance);
		  })
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;


// add at the end of the processing of the rebalance to close the middleware 
          res.json(req.body);
       }   // End of rebalance function definition
    };  // End of accounts object definition
module.exports = accounts;


