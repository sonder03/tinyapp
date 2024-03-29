const express = require("express");
const bcrypt = require("bcryptjs");
const helpers = require("./helpers.js");

const app = express();
const PORT = 3000;
var cookieSession = require("cookie-session");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["testcookie"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

/**
 * Generates a random string of the specified length.
 * @param {number} length: the length of the string to be generated
 * @@returns {string} The randomly generated string. 
 */

function generateString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
 * Retrieves the URLs associated with a specific user ID.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Object} An object containing the URLs associated with the user, where the URL IDs are the keys and the URL objects are the values.
 */
function urlsForUser(userId) {
  const userURLs = {};

  for (const urlId in urlDatabase) {
    const url = urlDatabase[urlId];

    if (url.userId === userId) {
      userURLs[urlId] = url;
    }
  }
  return userURLs;
}
const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  res.send("Hello TinyApp makers!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).send("You must be logged in to see the URLs.");
    return;
  }

  let filteredUrls = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: filteredUrls,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  //const id = req.params.id;
  const url = urlDatabase[req.params.id];

  if (!user) {
    res.send("<h1>Please log in or register first.</h1>");
    return;
  }

  if (!url) {
    res.status(404).send("<h1>URL not found</h1>");
    return;
  }
  if (url.userId !== userId) {
    res.send("<h1>You don't have permission to access this URL.</h1>");
    return;
  }

  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  res.render("login", { title: "Login", user: user });
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  res.render("register", { user: req.session.user_id ? user : null });
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("The requested short URL does not exist.");
    return;
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }
  let newId = generateString(6);
  urlDatabase[newId] = {};
  urlDatabase[newId].longURL = req.body.longURL;
  urlDatabase[newId].userId = req.session.user_id;
  res.redirect("urls/" + newId);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = helpers.getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Invalid email or password");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password");
  }

  // Compare the provided password with the hashed password using bcrypt.compareSync
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(403).send("Invalid email or password");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const user = users[req.session.user_id];
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const { id } = req.params;
  const longURL = req.body.editedUrl;
  urlDatabase[id].longURL = longURL;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.clearCookie("user_id");
  res.redirect("/login");
});

/* **********Register ***************/

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Check if email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty");
    return;
  }

  // Check if email already exists in users object
  if (helpers.getUserByEmail(email, users)) {
    res.status(400).send("Email already registered");
    return;
  }

  //  a new user object with hashedPassword
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateString(6);
  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
  };
  users[userId] = newUser;
  // Set user_id cookie and redirect to /urls
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
