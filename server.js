var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//MONGOOSE CONNECTION ----------------------------------

//MONGOOSE CONNECTION ----------------------------------

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/elEnganche";

mongoose.connect(MONGODB_URI);

// SAVED ARTICLES JSON-------------------------------

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

app.post("/api/notes", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log(dbNote);
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.get("/api/notes/:id", function(req, res) {
  db.Note.find({
    _headlineId: req.params.id
  })
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//SAVING ARTICLES / SETTING SAVED TO TRUE IN MONGO

//SAVING ARTICLES / SETTING SAVED TO TRUE IN MONGO

//SAVING ARTICLES / SETTING SAVED TO TRUE IN MONGO

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
  db.Note.deleteOne(
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
