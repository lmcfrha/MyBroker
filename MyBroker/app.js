
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , adapters = require('./adapters')
  , auth = require('./auth');


adapters.dbconnection.connect();
adapters.dbconnection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
	  if (error) throw error;
	  console.log('The solution is: ', results[0].solution);
	}); 
adapters.dbconnection.end();


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// mount the auth sub-app on /mybroker
app.use('/mybroker/', auth);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
