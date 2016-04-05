$(function() {
  var mainGame = {
    "gamePanelId" : "game-panel",
    "colorsTiles" : []
  };

  for ( i = 1; i <= 8; i++) {
    mainGame["colorsTiles"].push({
      "id" : i,
      "img" : "/images/colour" + i + ".gif"
    });
  }

  var game = new gameController(mainGame);
});

var gameController = function(mainGame) {
  this.gameObj = mainGame;
  this.start();
};

gameController.prototype.start = function() {
  this.colorPanel = _htmlConstruct("color-panel", "color-panel");
  $("#" + this.gameObj.gamePanelId).append(this.colorPanel);
  this.colorPanelCore = _htmlConstruct(false, "color-panel-core clearfix");
  this.gameStart = _htmlConstruct("color-memory-start", "color-memory-start");
  this.gamePanel = _htmlConstruct("color-game-panel", "color-game-panel");
  this.gameBuild = _htmlConstruct(false, "color-game-build");
  this.gamePanel.append(this.gameBuild);
  this.gameAlert = _htmlConstruct("game-on-end", "game-on-end");
  this.gameSetUp();
};

gameController.prototype.gameSetUp = function() {
  var gameObj = this;
  this.gameState = 1;
  this.colors = shuffle(this.gameObj.colorsTiles);
  this.card1 = "";
  this.card2 = "";
  this.card1id = "";
  this.card2id = "";
  this.card1flipped = false;
  this.card2flipped = false;
  this.flippedTiles = 0;
  this.userScore = 0;
  this.tries = 0;

  this.colorPanel.append(this.colorPanelCore);
  this.colorPanel.append(this.gameStart);

  $("#game-restart-button").click(function(e) {
    $(this).unbind('click');
    gameObj.resetGame();
    var num = $('#block-color-hover');
    $('#block-color-hover').focus().select();
    e.preventDefault();
    e.stopPropagation();
  });

  var gameHighScores = getResults('/game/highscores', "GET", {}, true);

  var scoreHtml = '';

  $(gameHighScores).each(function(index, elem) {
    scoreHtml += '<li>' + elem.username + ' | ' + elem.score + '</li>';
  });

  $('.game-high-score').html('<span class="high-score-title">Highscores</span><ul>' + scoreHtml + '</ul>');

  this.setupGameWrapper();
};

gameController.prototype.setupGameWrapper = function() {
  this.gameBuild.addClass("color-game-build game-build-plan");
  this.colorPanel.append(this.gamePanel);
  this.renderTiles();
}

gameController.prototype.renderTiles = function() {
  this.gridX = 4;
  this.gridY = 4;
  this.numTiles = this.gridX * this.gridY;
  this.halfNumTiles = this.numTiles / 2;
  this.newCards = [];

  for (var i = 0; i < this.halfNumTiles; i++) {
    var mu = this.colors[i];
    this.newCards.push(this.colors[i], this.colors[i]);
  }

  this.newCards = shuffle(this.newCards);
  var html = '';
  var hoverID = null;

  for (var i = 0; i < this.numTiles; i++) {
    var n = i + 1;

    html = _blockConstruct(html, hoverID, this, i, n);
  }

  this.gameBuild.html(html);
  this.gameState = 2;
  this.gamePlay();
};

gameController.prototype.gamePlay = function() {
  var tiles = $(".game-block-inner");

  for (var i = 0, len = tiles.length; i < len; i++) {
    var tile = tiles[i];
    this.gamePlayEvents(tile);
  };
};

gameController.prototype.gamePlayEvents = function(tile) {
  var gameObj = this;

  document.onkeydown = function(e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
      case 37:
        moveLeft();
        break;
      case 38:
        moveUp();
        break;
      case 39:
        moveRight();
        break;
      case 40:
        moveDown()
        break;
      case 13:
        flipCard(gameObj);
        break;
      default:
        return;
    }
  }
};

gameController.prototype.gameCardsMatch = function() {
  var self = this;

  this.startTime = (this.startTime === undefined) ? Math.floor(Date.now() / 1000) : this.startTime;
  window.setTimeout(function() {
    $(self.card1).addClass("correct");
    $(self.card2).addClass("correct");
  }, 200);

  window.setTimeout(function() {
    $(self.card1).removeClass("correct");
    $(self.card2).removeClass("correct");
    self.gameResetVars();
    self.flippedTiles = self.flippedTiles + 2;
    if (self.flippedTiles == self.numTiles) {
      self.winGame();
    }
  }, 1000);

  this.gameCounterPlusOne();
};

gameController.prototype.gameCardsMismatch = function() {
  var self = this;

  this.startTime = (this.startTime === undefined) ? Math.floor(Date.now() / 1000) : this.startTime;
  window.setTimeout(function() {
    $(self.card1).removeClass("flipped");
    $(self.card2).removeClass("flipped");
    self.gameResetVars();
  }, 900);

  this.gameCounterMinusOne();
};

gameController.prototype.gameResetVars = function() {
  this.card1 = "";
  this.card2 = "";
  this.card1id = "";
  this.card2id = "";
  this.card1flipped = false;
  this.card2flipped = false;
};

gameController.prototype.gameCounterPlusOne = function() {
  this.userScore = this.userScore + 1;
  this.tries = this.tries + 1;
  $("#current-score-count").html(this.userScore);
  $("#current-user-tries").html(this.tries);
};

gameController.prototype.gameCounterMinusOne = function() {
  this.tries = this.tries + 1;
  $("#current-score-count").html(this.userScore);
  $("#current-user-tries").html(this.tries);
};

gameController.prototype.clearGame = function() {
  if ($(this.colorPanelCore).parent().length > 0) {
    $(this.colorPanel).find('.color-panel-core').remove();
  }

  if ($(this.gameStart).parent().length > 0) {
    $(this.colorPanel).find('#color-memory-start').remove();
  }

  if (this.gamePanel.parent().length > 0) {
    $(this.colorPanel).find('#color-game-panel').remove();
  }

  if (this.gameAlert.parent().length > 0) {
    $(this.colorPanel).find('#game-on-end').remove();
  }

  $("#current-score-count").html(0);
  $("#current-user-tries").html(0);
};

function shuffle(o) {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

var selectCard = function() {
  var element = document.getElementById('block-color-hover');
  var eleChild = element.childNodes;
  var i = 0;
  var j = eleChild.length;

  while (i < j) {
    if (eleChild[i].className == "game-block-inner") {
      var elementCard = eleChild[i];
    }
    i++;
  }
};

gameController.prototype.winGame = function() {
  var gameObj = this;
  this.gameTime = Math.floor(Date.now() / 1000) - this.startTime;
  var minutes = Math.floor(this.gameTime / 60);
  var seconds = this.gameTime - minutes * 60;

  var gameStatus = {};
  gameStatus.score = this.userScore;
  gameStatus.time = this.gameTime;

  //getResults('/game/stats', "POST", gameStatus, true)

  this.clearGame();
  $(this.gameAlert).html(_scoreHtml(gameObj));
  $(this.colorPanel).append(this.gameAlert);

  $("#game-restart-button").click(function(e) {
    gameObj.resetGame();
    $('#block-color-hover').focus().select();
    e.preventDefault();
    e.stopPropagation();
    $(this).unbind("click");
  });

  $("#submit-score-button").click(function(e) {
    gameObj.submitScore();
    e.preventDefault();
  });
}

gameController.prototype.resetGame = function() {
  this.clearGame();
  this.gameSetUp();
};

gameController.prototype.submitScore = function() {
  this.saveUser();
  this.clearGame();
  this.gameSetUp();
};

var _htmlConstruct = function(id, className) {
  var html = "";

  if (id) {
    html = $('<div>').attr("id", id);
  }

  html = id ? html.addClass(className) : $('<div>').addClass(className);

  return html;
};

gameController.prototype.saveUser = function() {
  var result = {};
  result.username = $('#username').val();
  result.email = $('#email').val();
  result.score = this.userScore;
  result.time = this.gameTime;
  result.tries = this.tries;
  getResults('/game/user/add', "POST", result, false);
};

var getResults = function(url, type, obj, noReturn) {
  var results = [];

  $.ajax({
    type : type,
    url : url,
    async : false,
    cache : false,
    data : obj,
    success : function(res) {
      if (res) {
        results = res;
      }
    }
  });

  if (noReturn) {
    return results;
  }
};

var _blockConstruct = function(html, hoverID, gameObj, i, n) {
  if (n === 16) {
    hoverID = 'block-color-hover';
  }

  html += '<div class="game-block game-block-' + n + '" id="' + hoverID + '">';
  html += '<div class="game-block-inner" data-id="' + gameObj.newCards[i]["id"] + '">';
  html += '<span class="game-block-outside"></span>';
  html += '<span class="game-block-inside"><img src="' + gameObj.newCards[i]["img"] + '"></span>';
  html += '</div>';
  html += '</div>';

  return html;
};

var flipCard = function(gameObj) {
  var block = $('#block-color-hover');
  var blkChildren = block.children();

  var cardObj;

  $(blkChildren).each(function(index, child) {
    if ($(child).hasClass('game-block-inner')) {
      cardObj = child;
    }
  });

  if (cardObj !== undefined && !$(cardObj).hasClass("flipped")) {
    if (gameObj.card1flipped === false && gameObj.card2flipped === false) {
      $(cardObj).addClass("flipped");
      gameObj.card1 = cardObj;
      gameObj.card1id = $(cardObj).attr("data-id");
      gameObj.card1flipped = true;
    } else if (gameObj.card1flipped === true && gameObj.card2flipped === false) {
      $(cardObj).addClass("flipped");
      gameObj.card2 = cardObj;
      gameObj.card2id = $(cardObj).attr("data-id");
      gameObj.card2flipped = true;
      if (gameObj.card1id == gameObj.card2id) {
        gameObj.gameCardsMatch();
      } else {
        gameObj.gameCardsMismatch();
      }
    }
  }
};

var _scoreHtml = function(gameObj) {
  var html = '<p class="game-on-end-message">';
  html += 'You have tried it in ' + gameObj.tries + ' tries ,';
  html += 'you have score ' + gameObj.userScore + '<br>';
  html += 'Please submit the score to check for high scores </p><br>';
  html += '<input type="text" maxlength="20" class="input" name="username" id="username" placeholder="User Name"><br>';
  html += '<input type="email" class="input" name="email" placeholder="EmailId" id="email"><br><br>';
  html += ' <button id="submit-score-button" class="color-game-button">Submit Score</button><br><br>';
  html += '<button id="game-restart-button" class="color-game-button">Play again?</button>';

  return html;
};

var moveLeft = function() {
  var block = document.getElementById('block-color-hover')
  var pos = block.className.match(/\d+/)[0];
  if (parseInt(pos) !== 1) {
    block.removeAttribute("id");
    var blkName = "game-block-" + (parseInt(pos) - 1);
    var blkObj = document.getElementsByClassName(blkName)[0];
    blkObj.id = 'block-color-hover';
  }
  return;
};

var moveRight = function() {
  var block = document.getElementById('block-color-hover')
  var pos = block.className.match(/\d+/)[0];
  if (parseInt(pos) !== 16) {
    block.removeAttribute("id");
    var blkName = "game-block-" + (parseInt(pos) + 1);
    var blkObj = document.getElementsByClassName(blkName)[0];
    blkObj.id = 'block-color-hover';
  }
  return;
};

var moveUp = function() {
  var block = document.getElementById('block-color-hover')
  var pos = block.className.match(/\d+/)[0];
  if (parseInt(pos) > 4) {
    block.removeAttribute("id");
    var blkName = "game-block-" + (parseInt(pos) - 4);
    var blkObj = document.getElementsByClassName(blkName)[0];
    blkObj.id = 'block-color-hover';
  }
  
  return;
};

var moveDown = function() {
	
  var block = document.getElementById('block-color-hover')
  var pos = block.className.match(/\d+/)[0];
  if (parseInt(pos) <= 12) {
    block.removeAttribute("id");
    var blkName = "game-block-" + (parseInt(pos) + 4);
    var blkObj = document.getElementsByClassName(blkName)[0];
    blkObj.id = 'block-color-hover';
  }
  return;
};

/*var leftRightMove = function(keyNum) {
  var curentElem = $("#block-color-hover");
  var classAttr = $(curentElem).attr('class');
  var blockIndex = parseInt(classAttr.match(/[0-9]+/)[0], 10);

  if (blockIndex !== keyNum) {
    $(curentElem).removeAttr("id");
    var className = keyNum == 1 ? "game-block-" + (blockIndex - 1) : "game-block-" + (blockIndex + 1);
    var newDom = $("." + className);
    $(newDom).attr("id", "block-color-hover");
  }

  return;
};

var upDownMove = function(keyNum, type) {
  var curentElem = $("#block-color-hover");
  var classAttr = $(curentElem).attr('class');
  var blockIndex = parseInt(classAttr.match(/[0-9]+/)[0], 10);

  if (( type = "up" && blockIndex > keyNum) || ( type = "down" && blockIndex <= keyNum)) {
    $(curentElem).removeAttr("id");
    var className = keyNum == 4 ? "game-block-" + (blockIndex - 4) : "game-block-" + (blockIndex + 4);
    var newDom = $("." + className);
    $(newDom).attr("id", "block-color-hover");
  }

  return;
};*/

