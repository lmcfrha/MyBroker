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
      var sql = 'SELECT account.*,accountrecord.*  FROM account INNER JOIN accountrecord ON account.accountid = accountrecord.accountid where account.username=? ORDER BY account.accountid';
	  var inserts = [`${req.params.user}`];
	  var message;
	  sql = mysql.format(sql,inserts);
	  console.log(sql);
	  let resultid = new Object(); 
      resultid.username = `${req.params.user}`; // include the username in the response - in case it doesn't have any account.
	  adapters.mySqlPromise(sql)
	  .then((result)=>{
		        var length = result.length;
		        resultid.records = result;
		        console.log("Result: "+JSON.stringify(resultid));
		        res.send(resultid);
		    },
			(error)=>{console.log("Select Accounts SQL error");console.log(error.code)})
	  .catch((error) => {
		  console.log("Error backend query to Account tables: "+error);
		  res.json({ error: error })
		  }) 
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
  


