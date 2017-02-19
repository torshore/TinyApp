const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

function generateRandomString() {
 let text = "";
 let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for( var i=0; i < 6; i++){
  text += possible.charAt(Math.floor(Math.random() * possible.length));
 }
 return text;
}

function seeIfUserExists(users, emailString) {
  for (user in users){
    if (users[user].email === emailString) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  const userURLs = {};
  for (shortURL in urlDatabase){
    if (id === urlDatabase[shortURL].userID){
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
 "b2xVn2": {longURL: "http://www.lighthouselabs.ca",
            userID: "userRandomID"
          },

 "9sm5xK": {longURL: "http://www.google.com",
            userID: "user2RandomID" }
};

app.get("/urls", (req, res) => {
 let templateVars = { urls: urlsForUser(req.session.tinyapp), user: users[req.session.tinyapp] };
 if (!req.session.tinyapp) {
    res.redirect("/login");
  } else {
    return res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.tinyapp], }
  if (req.session.tinyapp) {
    return res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
 let shortId = generateRandomString();
 urlDatabase[shortId] = {longURL: req.body.longURL, userID: req.session.tinyapp}
 res.send("Ok");
});

app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.session.tinyapp]};
 res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newLong;
  res.redirect("/urls");
})

app.get("/", (req, res) => {
 res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
 res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(redirectURL);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.tinyapp] };
  res.render("urls_login", templateVars)
})

app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  for(var userID in users) {
    const check = bcrypt.compareSync(password, users[userID].password);
     if (users[userID].email === email && (check === true)) {
       req.session.tinyapp = userID;
       return res.redirect("/urls");
     }
   }
  return res.status(403).send("Please provide a valid email address and password to login");
  });

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  if (seeIfUserExists(users, req.body.email)) {
    res.status(400).send("This email already exists.");
  };

  if (!req.body.email || !password) {
    res.status(400).send("Please use a valid email and password");
  } else {
  let userID = generateRandomString();
  users[userID] = {id: userID, email: req.body.email, password: hashed_password};
  req.session.tinyapp = userID;
  res.redirect("/")
  }
});

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});