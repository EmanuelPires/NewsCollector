/* global bootbox */
$(document).ready(function() {
  console.log("hello from index");

  var articleContainer = $(".article-container");

  $(document).on("click", ".btn.save", handleArticleSave);

  $(document).on("click", ".scrape-new", handleArticleScrape);

  $(".clear").on("click", handleArticleClear);

  $("#savedArticles").on("click", initSavedPage);

  $(document).on("click", ".btn.delete", handleArticleDelete);

  $(document).on("click", ".btn.notes", handleArticleNotes);

  //INIT PAGE

  //INIT PAGE

  //INIT PAGE

  function initPage() {
    $.get("/api/articles/false").then(function(data) {
      articleContainer.empty();

      if (data && data.length) {
        renderArticles(data);
      } else {
        renderEmpty();
      }
    });
  }
  //INIT SAVED PAGE

  //INIT SAVED PAGE

  //INIT SAVED PAGE

  function initSavedPage() {
    $.get("/api/articles/true").then(function(data) {
      articleContainer.empty();

      if (data && data.length) {
        renderSavedArticles(data);
      } else {
        renderSavedEmpty();
      }
    });
  }

  function renderSavedArticles(articles) {
    var articleCards = [];

    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createSavedCard(articles[i]));
    }

    articleContainer.append(articleCards);
  }

  function createSavedCard(article) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr("href", "ole.com.ar" + article.link)
          .text(article.title),
        $("<a class='btn btn-danger delete float-right'>Delete From Saved</a>"),
        $(
          "<a class='btn btn-info notes float-right' data-toggle ='modal' data-target='#noteModal'>Article Notes</a>"
        ).attr("data-id", article._id)
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.description);

    card.append(cardHeader, cardBody);

    card.data("_id", article._id);

    return card;
  }

  function renderSavedEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );

    articleContainer.append(emptyAlert);
  }

  //RENDER UNSAVED ARTICLES

  //RENDER UNSAVED ARTICLES

  //RENDER UNSAVED ARTICLES

  function renderArticles(articles) {
    var articleCards = [];

    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }

    articleContainer.append(articleCards);
  }

  function createCard(article) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr("href", "ole.com.ar" + article.link)
          .text(article.title),
        $("<a class='btn btn-success save float-right'>Save Article</a>")
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.description);

    card.append(cardHeader, cardBody);

    card.data("_id", article._id);

    return card;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );

    articleContainer.append(emptyAlert);
  }

  //ARTICLE SAVE

  //ARTICLE SAVE

  //ARTICLE SAVE

  function handleArticleSave() {
    var articleToSave = $(this)
      .parents(".card")
      .data();

    $(this)
      .parents(".card")
      .remove();

    articleToSave.saved = true;

    console.log(articleToSave);
    $.ajax({
      method: "PUT",
      url: "/api/headlines/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      if (data.saved) {
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    console.log("hello hello hello");
    $.get("/api/fetch").then(function(data) {
      initPage();
    });
  }

  function handleArticleClear() {
    articleContainer.empty();
  }

  //SAVED ARTICLE DELETE

  //SAVED ARTICLE DELETE

  //SAVED ARTICLE DELETE

  function handleArticleDelete() {
    var articleToDelete = $(this)
      .parents(".card")
      .data();

    $(this)
      .parents(".card")
      .remove();

    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {
      if (data.ok) {
        initPage();
      }
    });
  }

  //RENDER NOTES

  //RENDER NOTES

  //RENDER NOTES

  function handleArticleNotes(event) {
    $(".modal-body").empty();
    // This function handles opening the notes modal and displaying our notes
    // We grab the id of the article to get notes for from the card element the delete button sits inside

    var currentArticle = $(this)
      .parents(".card")
      .data();
    // Grab any notes with this headline/article id
    $.get("/api/notes/" + currentArticle._id).then(function(data) {
      console.log("Empty Array still" + data);
      // Constructing our initial HTML to add to the notes modal

      var modalText = $("<div class='container-fluid text-center'>").append(
        $("<h4>").text("Notes For Article: " + currentArticle._id),
        $("<hr>"),
        $("<ul class='list-group note-container'>"),
        $("<textarea placeholder='New Note' rows='4' cols='45'>"),
        $("<button class='btn btn-success save'>Save Note</button>")
      );
      // Adding the formatted HTML to the note modal
      // bootbox.dialog({
      //   message: modalText,
      //   closeButton: true
      // });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      // Adding some information about the article and article notes to the save button for easy access
      // When trying to add a new note
      $(".btn.save").data("article", noteData);
      // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
      $(".modal-body").append(modalText);
      renderNotesList(noteData);
    });
  }

  function renderNotesList(data) {
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      currentNote = $(
        "<li class='list-group-item'>No notes for this article yet.</li>"
      );
      notesToRender.push(currentNote);
    } else {
      // If we do have notes, go through each one
      for (var i = 0; i < data.notes.length; i++) {
        // Constructs an li element to contain our noteText and a delete button
        currentNote = $("<li class='list-group-item note'>")
          .text(data.notes[i].noteText)
          .append($("<button class='btn btn-danger note-delete'>x</button>"));
        // Store the note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // Adding our currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    // Now append the notesToRender to the note-container inside the note modal

    $(".modal-body").append(notesToRender);
  }

  initPage();
});
