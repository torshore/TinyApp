var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString() {
 var text = "";
 var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

 for( var i=0; i < 6; i++){
  text += possible.charAt(Math.floor(Math.random() * possible.length));
 }
 return text;
}

var urlDatabase = {
 'b2xVn2': "http://www.lighthouselabs.ca",
 '9sm5xK': "http://www.google.com"
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
 let templateVars = { urls: urlDatabase };
 res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
 res.render("urls_new");
});

app.post("/urls", (req, res) => {
 console.log(req.body);  // debug statement to see POST parameters
 let shortId = generateRandomString();
 urlDatabase[shortId] = req.body.longURL;
 res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
 res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLong;
  res.redirect("/urls");
})

app.get("/", (req, res) => {
 res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
 res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
 res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});