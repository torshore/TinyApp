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
 'b2xVn2': {longURL: "http://www.lighthouselabs.ca",
            userID: "userRandomID"
          },

 '9sm5xK': {longURL: "http://www.google.com",
            userID: "user2RandomID" }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/urls", (req, res) => {
 let templateVars = { urls: urlsForUser(req.cookies.tinyapp), user: users[req.cookies.tinyapp] };
 res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.tinyapp], }
  if (req.cookies.tinyapp) {
    return res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
 console.log(req.body);  // debug statement to see POST parameters
 let shortId = generateRandomString();
 urlDatabase[shortId] = {longURL: req.body.longURL, userID: req.cookies.tinyapp}
 res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
 let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookie.tinyapp]};
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
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.tinyapp] };
  res.render("urls_login", templateVars)
})

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  for(var user_id in users) {
     if (users[user_id].email === email && users[user_id].password === password) {
       res.cookie("tinyapp", user_id);
       return res.redirect("/");
     }
   }
  return res.status(403).send("Please provide a valid email address and password to login");
  });

app.post("/logout", (req, res) => {
  res.clearCookie("tinyapp");
  res.redirect('/');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  if (seeIfUserExists(users, req.body.email)) {
    res.status(400).send("This email already exists.");
  };

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please use a valid email and password');
  } else {
  let userID = generateRandomString();
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  res.cookie("tinyapp", userID);
  res.redirect('/')
  }
  console.log(138, users);
});


app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});