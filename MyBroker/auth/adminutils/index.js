/*
 * 
 */
const config_mybroker = require('../../config/appConfig.json')['mybroker'];

function retrieveProfileContent(profilename,res) {
	 var sql = "SELECT * FROM ticker, profile where profile.profilename='"+profilename+"' and ticker.profilename='"+profilename+"'";
	 console.log(sql);
	 profileP = adapters.mySqlPromise(sql);
	 if (res !=null) {
		 profileP
		 .then((result)=>{res.send(result);})
		 .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
	 } 
	 else { return profileP}
	 }
exports.retrieveProfileContent=retrieveProfileContent;


function depositProfileAccount(amount,account,profilename,res) {
	 var sql = "UPDATE accountrecord SET units = units + "+amount+" where accountid="+account+" and profilename='"+profilename+"' and symbol='CASH'";
	 console.log(sql);
	 return adapters.mySqlPromise(sql) 
	 .then((result)=>{
		 if (res != null) {res.send(amount+" was deposited in profile "+profilename+" of account "+account+" :"+result);}
		 else {return result;}
	      } )
	 .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
	 }
exports.depositProfileAccount=depositProfileAccount;


function rebalanceProfileAccount(account,profilename,res) {
	let profile=[];
	let accountProfile=[];
	let orders=[];
	let ordersStatus=[];
	let err = null;
	let errRollback = null;
	var cashIdx = null;
	// First, retrieve the profile definition (profile):
	let profilePromise = retrieveProfileContent(profilename,null);
	profilePromise
	 .then((result)=>{
		      profile=result;
			  sql = "SELECT * FROM mybroker.accountrecord where accountid=? and profilename=?;";
			  inserts = [account, profilename];
			  sql = mysql.format(sql,inserts);
			  console.log(sql);
			  return adapters.mySqlPromise(sql);		       
		   })
	// Then, retrieve the account profile current statement (accountProfile):	   
     .then((result)=>{
    	 accountProfile=result; 
    	 console.log("Account Profile: ");
    	 console.log(accountProfile); 
    	 return accountProfile;})
    // Then build the rebalance order
     .then((result)=>{
    	 orders = rebalanceOrder(result,profile);
    	 return orders;})
    // Fake the execution orders to the backend (to the TSX exchange) 
     .then((result)=>{
    	 return executeOrders(result);})
    // Start Tx to update the DB, as a result of the execution orders, and initialize the cash position
     .then((results)=>{
    	 ordersStatus = results;
    	 if (ordersStatus.length === 0) throw("Already balanced. No need for action");
    	 cashIdx = accountProfile.findIndex(entry => entry.symbol === 'CASH');
    	 return adapters.mySqlPromiseTx(); })
    // Update DB according to Orders Execution status.
     .then((result)=>{
         console.log("SETTLE ACCOUNT TX STARTED "+result ); 
         return accountSettlement(ordersStatus,accountProfile,cashIdx);
         })
    // Update final cash position
	 .then((results)=>{
	     sql = "UPDATE accountrecord SET `units`=? where `symbol`='CASH' AND `accountid`=? AND `profilename`=?";
		 inserts = [accountProfile[cashIdx].units, ordersStatus[0].execution.account, ordersStatus[0].execution.profile];
         sql = mysql.format(sql,inserts);
         console.log(sql);
         return adapters.mySqlPromise(sql);
	     })
	// Commit the Tx:
     .then((results)=>{
	     return adapters.mySqlPromiseCommit();
      })
     .then((result)=>{
    	 console.log(result);
     })
// In case of problem, attempt a rollback:
     .catch((error)=>{
	     console.log("Error during Tx : "+error+ "- Attempting Rollback...");
	     err = error;
	     return adapters.mySqlPromiseRollback();
       })
// Check the rollback status
     .then((result)=>{
    	 console.log(result)},
    	   (reject)=>{errRollback=reject;
    	              console.log("!! ROLLBACK OPERATION FAILED !!"+reject)}
    	   )
     .finally(() => {
    		 if (err != null && errRollback != null) {
    			 res.send(err+"\nA DB rollback was attempted but failed:\n"+errRollback);
    		 }
    		 else if (err != null) {
    			 res.send(err);
    		 }
    		 else {
        	     let a = JSON.stringify(orders);
        	     let b = JSON.stringify(ordersStatus);
        	     res.send(a+b);
    		 }    
      adapters.emailTransport.sendMail(adapters.mailOptions, function(error, info){
	  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});
    		 
     })
}
exports.rebalanceProfileAccount=rebalanceProfileAccount;

function accountSettlement(orderStatus,accountProfile,cashIdx) {
// Update all account entries per execution order status:
	    let updateDB = Promise.all(orderStatus.map((orderStatus)=> 
           {
        	  let sql = null;
        	  let inserts = null;
              if ( orderStatus.status === 'fulfilled' && orderStatus.execution.type === 'buy') {
    			 sql = "INSERT INTO accountrecord (`symbol`, `exchange`, `accountid`, `profilename`, `units`) VALUES (?, 'TSX', ?, ?, ?) ON DUPLICATE KEY UPDATE `units`= `units` + ?";
			     inserts = [orderStatus.execution.ticker, orderStatus.execution.account, orderStatus.execution.profile, orderStatus.execution.qty, orderStatus.execution.qty];
			     accountProfile[cashIdx].units = accountProfile[cashIdx].units - orderStatus.execution.qty*orderStatus.unitcost;
              } 
              else if (orderStatus.status === 'fulfilled' && orderStatus.execution.type === 'sell') {
     			 sql = "INSERT INTO accountrecord (`symbol`, `exchange`, `accountid`, `profilename`, `units`) VALUES (?, 'TSX', ?, ?, ?) ON DUPLICATE KEY UPDATE `units`= `units` - ?";
			     inserts = [orderStatus.execution.ticker, orderStatus.execution.account, orderStatus.execution.profile, orderStatus.execution.qty, orderStatus.execution.qty];
			     accountProfile[cashIdx].units = accountProfile[cashIdx].units + orderStatus.execution.qty*orderStatus.unitcost; 
              }
              sql = mysql.format(sql,inserts);	
              console.log(sql);
              return adapters.mySqlPromise(sql);
           })
        );
	    return updateDB;
	 
	  }

	


function executeOrders(orderlist) {
	let orders = orderlist.filter(order => order.ticker != 'CASH');
	let ordersExecutionP = orders.map((order) => {return getOrderExecutionP(order)});
	return Promise.all(ordersExecutionP);
}

function getOrderExecutionP(order) {
	// Here would be the backend operation to the stock exchange
	// to fullfill the order - the promise returned would be resolved 
	// with a result being the quantities
	// purchased at which unit cost with an order status (filled, partial fill, failed)
	// In the current state of the app, the promise returned by this function is already resolved.
	// since this is just a simulation
	
	return new Promise((resolve,reject) => {
// The async request to TSX would occur here. We'll just resolve right away to a value which is the fullfillment report of the order:
         let executionReport = { execution: order,
        		                 status: 'fulfilled',
        		                 unitcost: quotesTape[order.ticker]
        		               };
         resolve(executionReport);
	})
}
function rebalanceOrder(profileRecords,profileDef) {
// We got all the data to issue a rebalance order:	
	// Current total value
	let totalValue = getTotalValue(profileRecords);
// Balanced desired situation [ticker: (value, units)]
	let profileUnitsNominal = getUnitsNominalProfile(totalValue, profileDef);
	console.log("LE PROFILE NOMINAL SERAIT: ");console.log(profileUnitsNominal);
	
	// Needind rebalancing (Current value deltas > 10%): [ticker: (value, units)]
	let orders = getOrders(profileRecords,profileUnitsNominal);
	// ordered by: biggest over to smallest over then biggest under to smallest under
	console.log(orders);
	return orders;
	// Rebalance order: sell overs, buy unders - fee per Tx assumed constant.
}


function getOrders(profileRecords,profileUnitsNominal) {

    let account = profileRecords[0].accountid;
    let profilename = profileRecords[0].profilename;
	let nominalProfileSymbolList = profileUnitsNominal.map(a=>a.symbol);
	let accProfileSymbolList = profileRecords.map(a=>a.symbol);
	let symbolchanges = compare(nominalProfileSymbolList,accProfileSymbolList);
	let addedSymbols = symbolchanges[0];
	let deletedSymbols = symbolchanges[1];
	let sellOrders =[];
	let buyOrders = [];
	// Fist Prepare the sell orders for stocks that have been deleted 
	// from profile but somehow are still in the account:
	let length = deletedSymbols.length;
	for (let i=0; i<length; i++) {
		let record = profileRecords.filter(record => record.symbol === deletedSymbols[i]);
		if (record[0].units >0) {
			sellOrders.push(new Order(account,profilename,deletedSymbols[i],record[0].units,'sell'));			
		}
	}
	// Then add added stocks not currently in the account records, (new in the profile def),
	// with 0 units to the profile records.
	length = addedSymbols.length;
	for (let i=0; i<length; i++) {
		let accountRecord = { 
				symbol: addedSymbols[i], 
				exchange: 'TSX', 
				accountid: account, 
				profilename: profilename,
				units: 0
				}
		profileRecords.push(accountRecord);
	}
	// Now identify stock that need rebalance 
	length = profileUnitsNominal.length;
	for (let i=0; i<length; i++) {
		let record = profileRecords.filter(record => record.symbol === profileUnitsNominal[i].symbol);
		let valueRecord = record[0].units * profileUnitsNominal[i].unitprice;
		let deltaValuePercent = (profileUnitsNominal[i].value - valueRecord) / profileUnitsNominal[i].value;
	    let deltaUnits = null;
		if (`${config_mybroker.maxdeviation}` < Math.abs(deltaValuePercent)) {
		    deltaUnits = Math.floor((profileUnitsNominal[i].value - valueRecord)/profileUnitsNominal[i].unitprice);		    
			if (deltaUnits > 0) {
				buyOrders.push(new Order(account,profilename,profileUnitsNominal[i].symbol,deltaUnits,'buy'));						
			}
			else {
				sellOrders.push(new Order(account,profilename,profileUnitsNominal[i].symbol,-deltaUnits,'sell'));			
			}
		}

	}	
	return sellOrders.concat(buyOrders);
	
}

 	
	


function compare(nomPrf,accPrf) {
	let length = nomPrf.length;
	let added = [];
	let deleted = [];
	for (let i=0; i<length; i++){
		if (accPrf.includes(nomPrf[i])) {
			accPrf.splice(accPrf.indexOf(nomPrf[i]),1);
		}
		else {
		   added.push(nomPrf[i]);
		}	
	}
	length = accPrf.length;
	for (let i=0; i<length; i++) {
		deleted.push(accPrf[i]);
	}
	return [added, deleted];
}

function getUnitsNominalProfile(value, profile) {
	let length = profile.length;
	let nominalProfile = [];
	for (let i=0; i<length; i++) {
		let item = {};
		let targetvalue = 0;
		let target = profile[i].target;
		item.symbol=profile[i].symbol;
		
		if (target != 0) {
		   targetvalue = value * target / 100;
  		   if (item.symbol === "CASH" ) { 
  			  item.unitprice = 1;
			  item.units = targetvalue;
			  item.value = targetvalue;
		   }
		   else {
			  item.unitprice = quotesTape[item.symbol];
			  if ( item.unitprice != 0)
			  item.units = Math.floor(targetvalue / item.unitprice);
			  item.value = Math.round(item.unitprice * item.units * 100)/100;
		   }
		}
		else {
			item.units = 0;
			item.unitprice = null;
			item.value = 0;
		}
		nominalProfile.push(item);
	}
	return nominalProfile;
}

function getTotalValue(profileRecords) {
     let total = 0;
     let length = profileRecords.length;
     for (let i=0; i<length; i++) {
    	 let symbol = profileRecords[i].symbol;
    	 let units = profileRecords[i].units;
    	 let unitvalue = null;
    	 if (symbol === "CASH" ) { unitvalue = 1.0}
    	 else {unitvalue = quotesTape[symbol]}
    	 total = total + unitvalue*units;
     }
     return total;
}



// Stock Orders
function Order(account,profile,ticker,qty,type) {
	  this.account = account;
	  this.profile = profile;
	  this.ticker = ticker;
	  this.qty = qty;
	  this.type = type;
	  var currentdate = new Date();
	  this.datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth()+1)  + "/" 
      + currentdate.getFullYear() + " @ "  
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();
	  this.status = null;
	}

