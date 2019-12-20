/*
 * 
 */
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
	// First, retrieve the profile definition (profile):
	 retrieveProfileContent(profilename,null)
	 .then((result)=>{
		      profile=result;
			  sql = "SELECT * FROM mybroker.accountrecord where accountid=? and profilename=?;";
			  inserts = [account, profilename];
			  sql = mysql.format(sql,inserts);
			  console.log(sql);
			  return adapters.mySqlPromise(sql);		       
		   })
	// Then, retrieve the account profile current statement (accountProfile):	   
     .then((result)=>{accountProfile=result; return accountProfile;})
     .then((result)=>{rebalanceOrder(result,profile);})
	 .catch(function(error) { console.log( "ERROR during rebalance "+account+" "+profilename); console.log( error.code )}) ;
	 
	 
	 
}
exports.rebalanceProfileAccount=rebalanceProfileAccount;

function rebalanceOrder(profileRecords,profileDef) {
	console.log("THE REBALANCE HAS STARTED:");
// We got all the data to issue a rebalance order:	
	console.log(profileRecords);
	console.log(profileDef);
	// Current total value
	let totalValue = getTotalValue(profileRecords);
	// Balanced desired situation [ticker: (value, units)]
	let profileUnitsNominal = getUnitsNominalProfile(totalValue, profileDef);
	console.log("LE PROFILE NOMINAL SERAIT: ");console.log(profileUnitsNominal);
	// Needind rebalancing (Current value deltas > 10%): [ticker: (value, units)]
	// ordered by: biggest over to smallest over then biggest under to smallest under
	
	// Rebalance order: sell overs, buy unders - fee per Tx assumed constant.
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
    	 else {unitvalue = 3}
    	 total = total + unitvalue*units;
     }
     return total;
}