/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
const config_financeapi = require('../config/appConfig.json')['financeapi'];

var app = module.exports = express();

// config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(express.urlencoded({ extended: false }));



app.get('/stock/:symbol', function(req, res){
	var quotes = [{ 'symbol': req.params.symbol }];
	getQuotesP(quotes)
	.then( (quotes) => {
			const $ = cheerio.load(quotes[0])
			var stockprice = $(".quote-price.priceLarge span").html();
			if (stockprice === null) res.send("Unknown");
			else res.send(stockprice)},
	        (reason) => {console.log(reason);res.send(reason)})
	.catch (function(err) {console.log(err);res.send(err)});
});


/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}