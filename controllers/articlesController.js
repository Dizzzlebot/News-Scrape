var express = require("express");
var router = express.Router();
// Hook mongojs configuration to the db variable
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

router.get("/", function (req, res) {
    // cat.all(function(data) {
    //   var hbsObject = {
    //     cats: data
    //   };

    // res.render("index", hbsObject);

    db.Article.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log(found);
            res.render("index", {
                articles: found
            });
        }
    });
});

router.post("/save/:id", function(req, res) {
    db.Article.findOneAndUpdate({_id:req.params.id}, {$set: {issaved: true}}, {new: true}).then(function(dbresponse) {
        res.status(200);
    })
})
// Main route (simple Hello World Message)
router.get("/saved", function (req, res) {
    db.Article.find({issaved: true}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log(found);
            res.render("index", {
                articles: found
            });
        }
    });
});


// Retrieve data from the db
router.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.Article.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            console.log(found)
            res.json(found)
        }
    });
});

router.post("/notes", function (req, res) {
    db.Notes.create(req.body).then(function (dbnotes) {
      res.json(dbnotes);
    
    })
});



router.get("/notes", function (req, res) {
    db.Notes.create(req.body).then(function (dbnotes) {
      res.json(dbnotes);
    })
})

// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://www.washingtonpost.com/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'


        // An empty array to save the data that we'll scrape

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        var results = [];
        $("h2.headline").each(function (i, element) {
            var result = {};
            // Save the text of the element in a "title" variable
            result.title = $(element).children("a").text();

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            result.link = $(element).children("a").attr("href");

            result.img = $(element).children("a").find("img").attr("src");


            // Save these results in an object that we'll push into the results array we defined earlier
            results.push(result);
        });

        // Log the results once you've looped through each of the elements found with cheerio
        console.log(results);
        db.Article.create(results, function (err, result) {
            if (err) console.log(err);
            res.redirect("/");

        });
    });

    //  res.send("Scrape Complete");

    // Listen on port 3000
});

module.exports = router;