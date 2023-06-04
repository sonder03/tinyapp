const express = require("express");
const morgan = require('morgan');

const app = express();
const PORT = 3000; 
let cookieParser = require('cookie-parser');


app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



function generateString(length) {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "8an1yZ": "http://https://www.amazon.ca/",
 };

app.get("/", (req, res) => {
  res.send("Hello TinyApp makers!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
const templateVars = { urls: urlDatabase, username: req.cookies["username"]}
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {username: req.cookies["username"], id: req.params.id, 
    longURL:urlDatabase[req.params.id],
    };
  //console.log(templateVars)
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
  const {id} = req.params
  const longURL = req.body.editedUrl;
  console.log("id:", id)
  console.log(longURL)
  urlDatabase[id]= longURL

  res.redirect("/urls");
});


app.post("/login", (req, res) =>{
 const {username} = req.body;
 res.cookie('username', username)
  res.redirect("/urls")

 });
 app.post("/logout", (req, res) =>{
  const {username} = req.body;
  res.clearCookie('username')
   res.redirect("/urls")
 
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});