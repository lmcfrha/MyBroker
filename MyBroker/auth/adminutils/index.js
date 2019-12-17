/*
 * 
 */
function retrieveProfileContent(profilename,res) {
	 var sql = "SELECT * FROM ticker, profile where profile.profilename='"+profilename+"' and ticker.profilename='"+profilename+"'";
	 console.log(sql);
	 return adapters.mySqlPromise(sql) 
	 .then((result)=>{
		 if (res != null) {res.send(result);}
		 else {return result;}
	      } )
	 .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
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