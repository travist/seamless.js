var express = require('express');
var app = express();

// Set the render engine to mustache.
app.set('views', __dirname + '/views');
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-middleware').__express);

// Use a cookie parser.
app.use(express.cookieParser());
app.use(express.bodyParser());

// Serve the seamless js files.
app.use('/build', express.static(__dirname + '/../../build'));
app.use('/css', express.static(__dirname + '/../../css'));

// If they get the base URL.
app.get('/', function(req, res) {
  res.render('index', {
    remembered: req.cookies.remember,
    submit: req.cookies.remember ? "Re-Submit" : "Submit"
  });
});

// Forget this person.
app.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.redirect('back');
});

// Set to remember this person.
app.post('/', function(req, res){
  if (req.body.remember) {
    var hour = 60 * 60 * 1000;
    res.cookie('remember', 1, { maxAge: hour });
  }
  res.redirect('back');
});

// Listen on port 80
app.listen(80);
