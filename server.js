'use strict'

const hbs = require('hbs');     
const express = require('express'); 
const app = express(); 
const path = require('path'); 

const port = 8080; 

const viewPath = path.join(__dirname, "/templates/views")

app.set('view engine', 'hbs'); 
app.set('views', viewPath); 
app.use(express.static("./public")); 

app.get('', (req, res) => {
    res.render("index", {}); 
}); 

app.listen(port, () => {
    console.log("app is listening on port 8080"); 
}); 