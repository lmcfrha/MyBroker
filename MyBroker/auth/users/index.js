/**
 * 
 *  Users module - Sub App 
 * 
 */
var express = require('express');
var path = require('path');


var app = module.exports = express();
//config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.get('/:user/accounts', function(req, res) {
      var sql = 'SELECT * from account where username=? ORDER BY accountid';
	  var inserts = [`${req.params.user}`];
	  var message;
	  sql = mysql.format(sql,inserts);
	  console.log(sql);
	  adapters.mySqlPromise(sql)
//	  .then((result)=>{var key = Object.keys(result[0])[0];console.log("Number of accounts using the profile: "+result[0][key])},
	  .then((result)=>{
		        var length = result.length;
		        console.log("Result: "+JSON.stringify(result));
		        res.send(result);
		     /*   if ( length === 0 )
		        	{
		        	var sqldelete = 'DELETE FROM profile WHERE profilename=?';
		  		    sqldelete = mysql.format(sqldelete,inserts);
		  		    console.log(sqldelete);
		  		    message = inserts + " DELETED.";
		 		    return adapters.mySqlPromise(sqldelete);
		        	}
		        else {
		        	var sqlupdate = 'UPDATE ticker SET target=0 WHERE profilename=?';
		        	sqlupdate = mysql.format(sqlupdate,inserts);
		        	console.log(sqlupdate);
		  		    message = inserts+" used in "+length+" accounts. PROFILE TARGETS ARE RESET TO 0. "+inserts+" will be deleted after next rebalance.";
		  		    return adapters.mySqlPromise(sqlupdate);
		            }*/
		        },
			(error)=>{console.log("Delete oooops");console.log(error.code)})
	  .catch(function() { message = "Screwed something went wrong!"  }) 
	  .finally (function() {console.log(message);res.json(message);});
});

app.get('/', function(req, res){
    // Retrieve Users - used by the listUsers script triggered by clicking on the
	// Users menu button. The result is used by  listUsers to populate the table
	// brought forward when the z-index of the div is increased.
	  var sql = "SELECT * FROM user;";
	  console.log(sql);
	  adapters.mySqlPromise(sql)
	  .then((result)=>{console.log("Users list:");console.log(result);res.send(result);} )
	  .catch(function(error) { console.log( "something went wrong:" ); console.log( error.code )}) ;
});


function users(req,res) {
       console.log("yeah well");
       
       res.json("user stuff");
}   
  


