const express = require('express'); 

const app = express(); 

// use a view engine don't use static please. 

app.use(express.static("./public")); 

app.get("/", (req, res) => {
    console.log(req.body); 
}); 

app.listen(8080, () => {
    console.log("app is listening on port 8080"); 
})