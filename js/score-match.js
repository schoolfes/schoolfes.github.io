var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");
var $targetPt = $("#target-pt");
var $currentPt = $("#current-pt");
var $endDatetime = $("#end-datetime");
var $difficulty = $("#difficulty");
var $expectedScore = $("#score");
var $expectedRanking = $("#ranking");


$(function() {
  $(".datetimepicker").datetimepicker({
    format: momentFormatString,
    minDate: Date.now(),
    maxDate: Date.now() + twoWeeksInMilliseconds
  });

  $("#difficulty-dropdown-menu li a").click(changeDifficulty);
  $("#score-dropdown-menu li a").click(changeScore);
  $("#ranking-dropdown-menu li a").click(changeRanking);

  $("#sif-calculate").click(showInput);

  if (jpEventEndDateTime.isValid()) {
    $endDatetime.val(jpEventEndDateTime.format(momentFormatString));
  }
});

function changeDifficulty() {
  $difficulty.text($(this).text());
}

function changeScore() {
  $expectedScore.text($(this).text());
}

function changeRanking() {
  $expectedRanking.text($(this).text());
}

function showInput() {
  errorTicket = false;
  showLovecaNeeded();
}


var ScoreMatch = function (endDatetime,
  difficulty, expectedScore, expectedRanking) {

  Event.call(this, endDatetime);

  this.difficulty = difficulty;
  this.expectedScore = expectedScore;
  this.expectedRanking = expectedRanking;
};

ScoreMatch.prototype = Object.create(Event.prototype);

ScoreMatch.prototype.clone = function () {
  return new ScoreMatch(Date.now() + this.remainingTimeInMinutes * 1000 * 60,
    this.difficulty, this.expectedScore, this.expectedRanking);
};


ScoreMatch.prototype.getTimeNeededPerGame = function () {
  return timeNeededPerSong;
};

ScoreMatch.prototype.getLpNeededPerGame = function () {
  switch (this.difficulty) {
    case "Technical":
    case "Expert":
    return Event.lpNeededPerSong[0];
    case "Hard":
    return Event.lpNeededPerSong[1];
    case "Normal":
    return Event.lpNeededPerSong[2];
    case "Easy":
    return Event.lpNeededPerSong[3];
    default:
    // TODO: error handing
  }
};

ScoreMatch.prototype.getScoreBonus = function () {
  switch (this.expectedScore) {
    case "S":
    return Event.scoreBonus[0];
    case "A":
    return Event.scoreBonus[1];
    case "B":
    return Event.scoreBonus[2];
    case "C":
    return Event.scoreBonus[3];
    default:
    return Event.scoreBonus[4];
  }
};

ScoreMatch.prototype.getRankingBonus = function () {
  switch (this.expectedRanking) {
    case "1st":
    return ScoreMatch.rankingBonus[0];
    case "2nd":
    return ScoreMatch.rankingBonus[1];
    case "3rd":
    return ScoreMatch.rankingBonus[2];
    case "4th":
    return ScoreMatch.rankingBonus[3];
    default:
    // TODO: error handling
  }
};

ScoreMatch.prototype.getPtGainedPerGame = function () {
  var basePt = 0;
  switch (this.difficulty) {
    case "Technical":
    case "Expert":
    basePt = ScoreMatch.basePt[0];
    break;
    case "Hard":
    basePt = ScoreMatch.basePt[1];
    break;
    case "Normal":
    basePt = ScoreMatch.basePt[2];
    break;
    case "Easy":
    basePt = ScoreMatch.basePt[3];
    break;
    default:
    // TODO: error handling
  }
  return Math.round(basePt * this.getScoreBonus() * this.getRankingBonus());
};

ScoreMatch.prototype.getExpGainedPerGame = function () {
  return Event.getExpGainedPerSong(this.difficulty);
};

ScoreMatch.basePt = [
  357, 177, 100, 42
];

ScoreMatch.rankingBonus = [
  1.25, 1.15, 1.05, 1.00
];

function showLovecaNeeded() {
  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var currentPt = parseInt($currentPt.val()) || 0;

  var endDatetime = $endDatetime.val();
  var difficulty = $difficulty.text();
  var expectedScore = $expectedScore.text();
  var expectedRanking = $expectedRanking.text();

  var user = new User(currentRank, currentExp, currentLp, targetPt, currentPt);
  setHasError($currentRank, (user.rank < 1));

  var scoreMatch = new ScoreMatch(Date.parse(endDatetime),
  difficulty, expectedScore, expectedRanking);
  // the event should not be ended, or has duration longer then 2 weeks
  setHasError($endDatetime, !(0 < scoreMatch.remainingTimeInMinutes && scoreMatch.remainingTimeInMinutes <= twoWeeksInMinutes));

  if (errorTicket === true) {
    return;
  }

  var loveca = getLovecaNeeded(user, scoreMatch);
  scoreMatch.run(loveca, user);

  if (errorTicket == false) {
    var message = "Loveca needed = " + loveca + "\n" +
    "==========\n" +
    "Final Rank: " + user.rank + "\n" +
    "Final Exp = " + user.exp + "\n"  +
    "Final Pt = " + user.currentPt + "\n";

    window.alert(message);
  }
}
