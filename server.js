var express = require('express');
var app = express();
var server = require('http').Server(app);

server.listen(8080);


// SERVE UP STATIC FILES FROM the /web folder

app.use('/', express.static(__dirname + '/web'));


// MAIN index loader
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/web/index.html');
});

// Some other index loader in a sub-folder

app.get('/old', function (req, res) {
  res.sendFile(__dirname + '/web/index_old.html');
});

app.get('/oldest', function (req, res) {
  res.sendFile(__dirname + '/web/index_oldest.html');
});

app.get('/beta', function (req, res) {
  res.sendFile(__dirname + '/web/beta/index.html');
});

app.get('/v4', function (req, res) {
	res.sendFile(__dirname + '/web/v4/index.html')
})

app.get('/v5', function (req, res) {
	res.sendFile(__dirname + '/web/v5/index.html')
})
