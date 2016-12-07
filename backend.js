const bodyParser = require('body-parser'),
      express = require('express'),
      app = express(),
      fs = require('fs'),
      marked = require('marked'),
      pg = require('pg-promise')();
      token = 'imatoken';
      randomString = require('randomstring');

// app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
var db = pg('express_db');


function auth(request, response, next) {
  if (request.query.token === token) {
    console.log('the token worked!');
    next();
  }
  else {
    console.log('oh, no. you are gonna die because the token did not work.');
  }
}

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  db.query('SELECT * FROM users WHERE users.username = $1', [username]).then(function(data) {
    if (username === data[0].username && password === data[0].password) {
      console.log('you logged in');
      db.query('SELECT token FROM auth_token WHERE customer_id = $1', [data[0].id]).then(function(data) {
        res.json({
          username: username,
          token: data[0].token
        });
      });
    }
    else {
      console.log('your did not log in.');
    }
  });
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log(username, password);
  db.query('INSERT INTO users VALUES (default, $1, $2)', [username, password]).then(function() {
    db.query('SELECT id FROM users WHERE username = $1', [username]).then(function(data) {
      var token = randomString.generate();
      db.query('INSERT INTO auth_token VALUES ($1, default, $2)', [token, data[0].id]).then(function() {
        res.json({message: 'you just added a user'});
      });
    });
  });
});

app.use(function logger(request, response, next) {
  var filepath = './data/log.txt';
  var log = 'method: ' + request.method + '  path: ' + request.path + '  date: ' + new Date() + '\n';
  fs.appendFile(filepath, log, function(err) {
    if (err) {
      console.log('the computer said, ', err.message);
    }
    console.log('success');
  });
  next();
});

app.put('/documents/:filepath', auth, function(req, res) {
  var filepath = req.params.filepath;
  var contents = req.body.contents;
  if (auth) {
    db.query('INSERT INTO files VALUES (default, $1, $2)', [filepath, contents]).then(function() {
      res.json({message: 'you put the file in the database'});
    });
  }
  else {
    res.json({message: 'not authorized'});
  }
});

app.get('/documents/:filepath', auth, function(req, res) {
  var filepath = req.params.filepath;
  if (auth) {
    db.query('SELECT * FROM files WHERE filepath = $1', filepath).then(function(data) {
      res.json({ filepath: data[0].filepath, contents: data[0].contents });
    });
  }
  else {
    res.json({message: 'not authorized'});
  }
});

app.get('/documents/:filepath/display', auth, function(req, res) {
  var filepath = req.params.filepath;
  if (auth) {
    db.query('SELECT * FROM files WHERE filepath = $1', [filepath]).then(function(data) {
      res.render('hello.hbs', {
        filepath: data[0].filepath,
        contents: marked(data[0].contents.toString())
      });
    });
  }
  else {
    res.json({message: 'not authorized'});
  }
});

app.get('/documents', function(req, res) {
  var object = [];
  if (auth) {
    db.query('SELECT * FROM files').then(function(data) {
      for (var i = 0; i < data.length; i++) {
        object.push(data[i]);
      }
      res.json(object);
    });
  }
  else {
    res.json({message: 'not authorized'});
  }
});

app.delete('/documents/:filepath', auth, function(req, res) {
  var filepath = req.params.filepath;
  db.query('DELETE FROM files WHERE filepath = $1', [filepath]).then(function() {
    if (auth) {
      res.json({message: 'it was deleted'});
    }
    else {
      res.json({message: 'not authorized'});
    }
  });
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
