var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/elEnganche", {
  useNewUrlParser: true
});

// Routes
app.get("/api/articles/:saved", function(req, res) {
  db.Article.find({ saved: req.params.saved })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/saved", function(req, res) {
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get;
// A GET route for scraping the echoJS website
app.get("/api/fetch", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.ole.com.ar/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".entry-title").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    console.log("Scrape Complete");
  });
});

// Route for updating saved column to true on each article.
app.put("/api/headlines/:id", function(req, res) {
  db.Article.findOneAndUpdate(
    {
      _id: req.params.id
    },
    {
      $set: {
        saved: req.body.saved
      }
    },
    function(error, data) {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    }
  );
});

app.delete("/api/headlines/:id", function(req, res) {
  db.Article.findOneAndDelete(
    {
      _id: req.params.id
    },
    function(error, data) {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    }
  );
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
