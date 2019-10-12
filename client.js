var express = require('express')
var app = express()
var http = require('http')
var server = http.createServer(app)

server.listen(3000);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
