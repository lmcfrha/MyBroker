/**
 * 
 *  MySql adapter 
 * 
 */
const config_mysql = require('../config/appConfig.json')['mysql']
var mysql      = require('mysql');
exports.dbconnection = mysql.createConnection({
  host     : `${config_mysql.host}`,
  port     : `${config_mysql.port}`,
  user     : `${config_mysql.user}`,
  password : `${config_mysql.password}`,
  database : `${config_mysql.database}`
});
