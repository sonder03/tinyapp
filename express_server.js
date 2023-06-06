const express = require("express");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000; 
let cookieParser = require('cookie-parser');


app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secret-key', // Add your own secret key here
  resave: false,
  saveUninitialized: true
}));


function generateString(length) {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "8an1yZ": "http://https://www.amazon.ca/",
 };

//Users database
 const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};


app.get("/", (req, res) => {
  res.send("Hello TinyApp makers!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user: user
  };
  
  res.render("urls_new", templateVars);
 
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console

  let newId = generateString(6);
  urlDatabase[newId]=req.body.longURL;
  res.redirect('urls/');  //+ newId


});

 app.get("/u/:id", (req, res) => {
 const longURL = urlDatabase[req.params.id]
 res.redirect(longURL)
 });

 app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id] 
 // console.log("deleted url")
  res.redirect("/urls")

 });
 
 app.post("/urls/:id/edit", (req, res) =>{
  const user = users[req.session.user_id];
  const {id} = req.params
  const longURL = req.body.editedUrl;
  console.log("id:", id)
  console.log(longURL)
  urlDatabase[id]= longURL

  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let authenticatedUser = null;
  // Find the user with the matching email and password
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      authenticatedUser = user;
      break;
    }
  }

  if (authenticatedUser) {
    res.cookie("user_id", authenticatedUser.id);
  } else {
    res.clearCookie("user_id");
  }

  res.redirect("/urls");
});



 app.post("/logout", (req, res) =>{
  const {username} = req.body;
  res.clearCookie('username')
  req.session.user_id = null;
   res.redirect("/urls")
 
  });


  app.get("/register", (req, res) => {
    res.render("register");
  });

/* **********Register        */

  app.post("/register", (req, res) => {
    const { email, password } = req.body;

    // Check if email or password are empty strings
    if (!email || !password) {
      res.status(400).send("Email or password cannot be empty");
      return;
    }
  
    // Check if email already exists in users object
    if (getUserByEmail(email)) {
      res.status(400).send("Email already registered");
      return;
    }
  
    //  a new user object a
    const userId = generateString(6);
    const newUser = {
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10) 
    };
    users[userId] = newUser;

    console.log(users)
  
    // Set user_id cookie and redirect to /urls
    req.session.user_id = userId;
    res.redirect("/urls");
  });


///////////
 
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});