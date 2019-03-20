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

// A GET route for scraping the echoJS website
app.get("/api/fetch", function(req, res) {
  axios.get("http://www.ole.com.ar/").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".entry-data").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .find("a")
        .attr("title");
      result.link = $(this)
        .find("a")
        .attr("href");
      result.description = $(this)
        .find("p")

        .text();

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("scrape complete");
  });
});

//GET BACK TO THIS

app.get("/api/notes/:id", function(req, res) {
  db.Note.find({
    _id: req.params.id
  })
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.json(err);
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

// app.delete("/api/headlines/:id", function(req, res) {
//   db.Article.find(
//     {
//       _id: req.params.id
//     },
//     function(error, data) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(data);
//       }
//     }
//   );
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
