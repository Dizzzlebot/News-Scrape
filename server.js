// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible


// Initialize Express
var app = express();
var port = 3000

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/newsdb", {
  useNewUrlParser: true
});

var routes = require("./controllers/articlesController");

app.use(routes);


app.listen(3000, function () {
    console.log("App running on port 3000!");
});