// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    Article.find({}, null, {
        sort: {
            created: -1
        }
    }, function (err, data) {
        if (data.length === 0) {
            res.render("placeholder", {
                message: "There's nothing scraped yet. Please click \"Scrape For Newest Articles\" for fresh and delicious news."
            });
        } else {
            res.render("index", {
                articles: data
            });
        }
    });
});


// Retrieve data from the db
app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.washingtonpost.com//").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);

        var result = {};
        $("div.story-body").each(function (i, element) {
            var link = $(element).find("a").attr("href");
            var title = $(element).find("h2.headline").text().trim();
            var summary = $(element).find("p.summary").text().trim();
            var img = $(element).parent().find("figure.media").find("img").attr("src");
            result.link = link;
            result.title = title;
            if (summary) {
                result.summary = summary;
            };
            if (img) {
                result.img = img;
            } else {
                result.img = $(element).find(".wide-thumb").find("img").attr("src");
            };
            var entry = new Article(result);
            Article.find({
                title: result.title
            }, function (err, data) {
                if (data.length === 0) {
                    entry.save(function (err, data) {
                        if (err) throw err;
                    });
                }
            });
        });

        // Send a "Scrape Complete" message to the browser
    });

    res.send("Scrape Complete");

    // Listen on port 3000
    app.listen(3000, function () {
        console.log("App running on port 3000!");
    });
});