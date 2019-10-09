'use strict'

const hbs = require('hbs');     
const express = require('express'); 
const mongodb = require('mongodb'); 
const app = express(); 
const path = require('path'); 
const bodyParser = require('body-parser'); 

const port = 8080; 
const mongo = mongodb.MongoClient; 
const mongoUrl = 'mongodb://127.0.0.1:27017'; 
const dbName = 'ps-blog'; 
const viewPath = path.join(__dirname, "/templates/views")

// setup for the rendering and routing
app.set('view engine', 'hbs'); 
app.set('views', viewPath); 

// configure handlebars setup
hbs.registerPartials('./templates/partials'); 
hbs.registerHelper('ifEquals', function(arg1, arg2, options){
    console.log(arg1, arg2);
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this); 
}); 

app.use(express.static("./public")); 
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json()); 

var loggedIn = false; 
var currentUser = ""; 

const getDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date = new Date(); 
    let result = days[date.getDay()] + ' ' + months[date.getMonth()] + ' ' + date.getFullYear(); 
    return result; 
}

app.get('', (req, res) => {
    var comments = []; 

    mongo.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client){
        if(err) return console.log('error connecting to mongo'); 
        const documents = client.db(dbName).collection('comments').find();   
        documents.forEach((doc, err) => {
            if(err) return console.log("couldn't find document"); 
            if(doc.username === currentUser){
                comments.push({doc, isEqual: true}); 
            }else{
                comments.push({doc, isEqual: false}); 
            } 
        }, () => {
            res.render('', {comments, loggedIn, currentUser});
        }); 
    }); 

}); 

app.get('/login', (req, res) => {
    res.render('login'); 
}); 

app.get('/signup', (req, res) => {
    res.render('signup'); 
}); 

app.post('/delete', (req, res) => {

}); 

app.post('/logout', (req, res) => {
    loggedIn = false; 
    currentUser = '';
    res.redirect("../"); 
}); 

app.post('/login-check', (req, res) => {
    const username = req.body.username; 
    const password = req.body.password; 

    mongo.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
        if(err) return console.log('error connecting to mongo');
        const db = client.db(dbName); 
        db.collection('users').find({username: username, password: password}, {"_id": 0, username: 1, password: 1}).limit(1).count((err, count) => {
            if(err) return console.log('error counting documents...'); 
            if(count < 1) res.redirect('../login'); 
            else{
                currentUser = username; 
                loggedIn = true; 
                res.redirect('../'); 
            }
        }); 
    }); 
}); 

app.post('/signup-post', (req, res) => {
    const pword = req.body.OnePassword;
    const name = req.body.username; 

    console.log(name, pword, req.body.TwoPassword); 
    if(req.body.OnePassword != req.body.TwoPassword || !pword || /^\s*$/.test(pword) || !name || /^\s*$/.test(name)){
        res.render('signup'); 
        return; 
    }
    
    const newUser = {
        username: req.body.username,  
        password: req.body.OnePassword
    }

    mongo.connect(mongoUrl, {useNewUrlParser: true}, function(err, client){
        if(err) return console.log('error connecting to mongo');
        const db = client.db(dbName); 

        /*****************************
         * check to see if there is already another user with the same credentials? 
         */

        db.collection('users').insertOne(newUser, (err, result) => {
            if(err) console.log('error adding a new user to the db'); 
            console.log('insert worked on new user'); 
        });
    });

    loggedIn = true; 
    currentUser = newUser.username; 
    res.redirect('../'); 
}); 

app.post('/insert-comment', (req, res) => {
    const date = getDate(); 

    const comment_Info = {
        comment: req.body.comment, 
        username: currentUser, 
        date
    }

    mongo.connect(mongoUrl, function(err, client) {
        if(err) return console.log('error connecting to mongo'); 
        const db = client.db(dbName); 
        db.collection('comments').insertOne(comment_Info, (err, result) => {
            if(err) return console.log('cannot insert into database'); 
            console.log('insert worked'); 
        }); 
    }); 
    res.redirect('../'); 
}); 


app.listen(port, () => {
    console.log("app is listening on port 8080"); 
}); 