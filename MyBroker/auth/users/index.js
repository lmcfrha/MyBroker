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
app.use('/', users);



function users(req,res) {
       console.log(req.body.profile);
       res.json("user stuff");
}   
  


