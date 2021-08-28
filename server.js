require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

let urlCounter = 0;
const store = new Map();

app.post('/api/shorturl', (req,res, next) => {
  console.log(req.body.url);
  if(validURL(req.body.url)) {
    urlCounter++;
    originalUrl = req.body.url;
    store.set(parseInt(urlCounter), originalUrl);
    next();
  } else {
    res.json({ error: 'invalid url' });
  }
}, (req, res) =>{
  res.json({ original_url : req.body.url, short_url : urlCounter});
})

app.get('/api/shorturl/:urlId',(req, res) => {
  console.log("url ID = " + req.params.urlId);
  // res.json({"url ": store.get(parseInt(req.params.urlId))});
  res.redirect(store.get(parseInt(req.params.urlId)));
})