/**
 * 
 *  MySql adapter 
 * 
 */
const config_mysql = require('../config/appConfig.json')['mysql']
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '`${config_mysql.host}`',
  port     : '3306',
  user     : 'tmoes',
  password : 'tmoes',
  database : 'tmoes'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();