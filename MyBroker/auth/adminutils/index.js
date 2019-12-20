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
	// First, retrieve the profile definition
	 retrieveProfileContent(profilename,null)
	 .then((result)=>{
		      profile=result;
			  sql = "SELECT * FROM mybroker.accountrecord where accountid=? and profilename=?;";
			  inserts = [account, profilename];
			  sql = mysql.format(sql,inserts);
			  console.log(sql);
			  return adapters.mySqlPromise(sql);		       
		   })
     .then((result)=>{console.log(result)})
	 .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
	 
	 
	 
}
exports.rebalanceProfileAccount=rebalanceProfileAccount;