

MyBroker
========



## Usage



## Development
Based on:
- [http://expressjs.com](http://expressjs.com) framework
- session store [express-mysql-session](https://www.npmjs.com/package/express-mysql-session)
- [Server side events information](https://stackoverflow.com/questions/11077857/what-are-long-polling-websockets-server-sent-events-sse-and-comet)
[sse example](https://tomkersten.com/articles/server-sent-events-with-node/)
- Database Design:
[https://app.sqldbm.com/MySQL/Edit/p54183/](https://app.sqldbm.com/MySQL/Edit/p54183/)

Using (not anymore - getting stocks from TSX directly...) stock quotes from Alphavantage. Example:
[https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSX:ALA&apikey=MCAF9B429I44328U](https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSX:ALA&apikey=MCAF9B429I44328U)


{
    "Global Quote": {
        "01. symbol": "TSX:ALA",
        "02. open": "13.8400",
        "03. high": "13.8500",
        "04. low": "13.4000",
        "05. price": "13.5500",
        "06. volume": "1213500",
        "07. latest trading day": "2019-01-24",
        "08. previous close": "13.9500",
        "09. change": "-0.4000",
        "10. change percent": "-2.8674%"
    }
}

## Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
 

Nodeclipse is free open-source project that grows with your contributions.

# Architecture

## app.js
This is the application main module. It loads:
- the adapters module (./adapters): loads the database config from config/appConfig.json; creates the mysql connection (dbconnection); initialize the DB if needed;  loads request-promise-native (simplified HTTP request) and cheerio (jQuery for NodeJS); setup a periodic task to retrieve all the stock prices, store them in a Json object and print them on the console. 
- sets up the express app.
- wait 5 sec before printing a list of the tickers and the profiles read from the database (this is the signal that everything is up and running.

## express app organization
Once the express app is created:
- set the app settings (where are the views to render, using which rendering engine, on what port to listen....)
- setup the middleware stack: favicon, logger, parser, root for serving static files (./public) 
- mount the sub apps:

	1. express app utils mounted on /mybroker/utils/		
	2. express app auth mounted on /mybroker

## Sub app _utils_ 
## Sub app _auth_ 

