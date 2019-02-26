
/**
 * Module dependencies.
 * By the way this is a pretty old express version 3.2.6 according to package.json.
 * In his older express version, some middleware was bundled, as part of the connect module.
 * Check the node_modules/connect/lib/middleware folder to get the idea.
 */

/* Global vars */
adapters = require('./adapters')
tickerTape = {};

/* Module vars */
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , auth = require('./auth')
  , utils = require('./utils');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//mount the utils sub-app (a bunch of utility API) 
app.use('/mybroker/utils/', utils);
//mount the auth sub-app on /mybroker
app.use('/mybroker/', auth);


app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

setTimeout(function (){
	console.log(adapters.profiles);
	console.log(adapters.tickers[1]);
/*	adapters.dbconnection.end();*/
}, 5000);