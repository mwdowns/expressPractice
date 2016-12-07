app.get('/', function(req, res) {
  res.send('Hello World');
});

app.get('/name/:name/age/:age', function(req, res) {
  var name = req.params.name || 'world';
  var year = 2016 - req.params.age;

  res.render('hello.hbs', {
    name: name,
    year: year
  });
  // res.send('Hello ' + name + '!<br> You were born in ' + year);
});

app.post('/', function(req, res) {
  var name = req.body.name;
  var year = 2016 - req.body.age;
  var message = 'hello ' + name + '! you were born in ' + year + '.\n';

  fs.appendFile('output.txt', message, function(err) {
    if (err) {
      console.log('the computer said, ', err.message);
      return;
    }
    else {
      res.json({message: 'your stuff was posted'});
      console.log('success');
    }
  });
});
