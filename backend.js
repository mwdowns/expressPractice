const bodyParser = require('body-parser'),
      express = require('express'),
      app = express(),
      fs = require('fs'),
      marked = require('marked'),
      pg = require('pg-promise')();

// app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
var db = pg('markdown_db');

app.put('/documents/:filepath', function(req, res) {
  var filepath = './data/' + req.params.filepath;
  var contents = req.body.contents;

  db.query('INSERT INTO files VALUES (default, $1, $2)', [filepath, contents]);

  // fs.writeFile(filepath, contents, function(err) {
  //   if (err) {
  //     res.json({message: 'the computer said, ' + err.message});
  //     return;
  //   }
  //   else {
  //     res.json({ message: 'file' + filepath + ' saved.' });
  //     console.log('success');
  //   }
  // });
});

app.get('/documents/:filepath', function(req, res) {
  console.log(req.params.filepath);
  var filepath = req.params.filepath;
  var query = db.query('SELECT * FROM files WHERE filename = $1', filepath);

  res.json(

  // fs.readFile('data/' + filepath, function(err, buffer) {
  //   if (err) {
  //     console.log('the error was ', err.message);
  //   }
  //   else {
  //     res.json({ filepath: filepath, contents: buffer.toString() });
  //   }
});

app.get('/documents/:filepath/display', function(req, res) {
  console.log(req.params.filepath);
  var filepath = req.params.filepath;
  fs.readFile('data/' + filepath, function(err, buffer) {
    if (err) {
      console.log('the error was ', err.message);
    }
    else {
      console.log(marked(buffer.toString()));
      res.render('hello.hbs', {
        filepath: filepath,
        contents: marked(buffer.toString())
      });
    }
  });
});

app.get('/documents', function(req, res) {
  fs.readdir('data', function(err, data) {
    if (err)  {
      console.log('this is the error: ', err.message);
    }
    else {
      res.json(data);
    }
  });
});

app.delete('/documents/:filepath', function(req, res) {
  var filepath = 'data/' + req.params.filepath;
  console.log(filepath);
  fs.unlink(filepath, function(err) {
    if (err) {
      console.log('the error was ', err.message);
    }
    else {
      res.json({message: 'you deleted ' + filepath + '!'});
    }
  });
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
