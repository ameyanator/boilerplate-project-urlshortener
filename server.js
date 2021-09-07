require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var mongodb = require('mongodb')
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

function shorterUrl() {
  var text = "";
  var possible =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (var i = 0; i < 5; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  
  return text;
}

let urlCounter = 0;
const store = new Map();

const uri = process.env.MONGO_URI
console.log("Uri is "+uri);
mongoose.connect(uri, {serverSelectionTimeoutMS: 20000});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url : String,
  short_url: String
})
const URL = mongoose.model("URL",urlSchema);

app.post('/api/shorturl', (req,res, next) => {
  console.log(req.body.url);
  if(!validURL(req.body.url)) {
    res.status(401).json({ error: 'invalid url' });
  } else {
    next();
  }
}, (req, res) =>{
  const urlPair = new URL({original_url: req.body.url, short_url: shorterUrl()});
  urlPair.save((err) => {
    if(err) {
      console.log("Error saving document");
    }
  })
  res.json({ original_url : urlPair.original_url, short_url : urlPair.short_url});
})

app.get('/api/shorturl/:urlId', async (req, res) => {
  console.log("url ID = " + req.params.urlId);
  const urlPair = await URL.findOne({short_url: req.params.urlId});
  res.redirect(urlPair.original_url);
  // res.json({"url ": store.get(parseInt(req.params.urlId))});
  // res.redirect(store.get(parseInt(req.params.urlId)));
})