var express = require('express');
var app = express();
const server = require('http').createServer(app);
const db = require('./dynamo');
const port = 5050
app.set('view engine', 'ejs');

server.listen(port);

console.log("Port: " + port);


app.get('/',async function(req,res){
    const data = await db.Get();
    if(!data) return res.send("ERROR")
    res.render('index.ejs',{
        connections:data.Items
    })
})



require('./cron');