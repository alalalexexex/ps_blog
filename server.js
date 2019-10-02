'use strict'

const hbs = require('hbs');     
const express = require('express'); 
const mongodb = require('mongodb'); 
const app = express(); 
const router = express.Router(); 
const path = require('path'); 

const port = 8080; 
const mongo = mongodb.MongoClient; 
const mongoUrl = 'mongodb://127.0.0.1:27017'; 
const dbName = 'ps-blog'; 
const viewPath = path.join(__dirname, "/templates/views")

app.set('view engine', 'hbs'); 
app.set('views', viewPath); 
app.use(express.static("./public")); 
app.use('/insert-comment', router); 

const getDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date = new Date(); 
    let result = days[date.getDay()] + ' ' + months[date.getMonth()] + ' ' + date.getFullYear(); 
    return result; 
}

app.get('', (req, res) => {
    var comments = []; 

    mongo.connect(mongoUrl, {useNewUrlParser: true}, function(err, client){
        if(err) return console.log('error connecting to mongo'); 
        const documents = client.db(dbName).collection('comments').find();   
        documents.forEach((doc, err) => {
            if(err) return console.log("couldn't find document"); 
            comments.push(doc); 
            console.log(comments); 
        }, () => {
            res.render('', {comments}); 
        }); 
    }); 

}); 

app.get('/insert-comment', (req, res) => {
    const date = getDate(); 

    const comment_Info = {
        comment: req.query.comment, 
        username: req.query.username, 
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