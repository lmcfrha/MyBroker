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
