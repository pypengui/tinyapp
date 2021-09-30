const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.set("view engine", "ejs");
function generateRandomString() {
  const rand = Math.random().toString(36).substr(2, 8);
  return rand;
}
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "123"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "123"
  }
};

const addNewUser = (email, password) => {
  const newShortURL = generateRandomString();

  users[newShortURL] = {
    id: newShortURL,
    email: email,
    password: password
  };

  return newShortURL;
};

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }

  return false;
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);

  if (user && user.password === password) {
    return user.id;
  }

  return false;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_new", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let userId = null;

  try {
    console.log("req.cookies", req.cookies);
    userId = req.cookies["user_id"];
  } catch (error) {}

  console.log({ userId });
  const currentUser = users[userId];

  const templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: null
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  console.log("hello woasda", req.params.id);
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = longURL;
  console.log("urlDatabase", urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };

  res.render("register.ejs", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email);
  if (!user) {
    const userId = addNewUser(email, password);
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(403).send("User is already registered!");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userId = authenticateUser(email, password);

  if (userId) {
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(401).send("Wrong credentials");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});