var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");

var $currentPt = $("#current-pt");
var $targetPt = $("#target-pt");
var $endDatetime = $("#end-datetime");

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
  return Event.lpNeededPerSong[this.difficulty];
};

ScoreMatch.prototype.getScoreBonus = function () {
  return Event.scoreBonus[this.expectedScore];
};

ScoreMatch.prototype.getRankingBonus = function () {
  return ScoreMatch.rankingBonus[this.expectedRanking];
};

ScoreMatch.prototype.getPtGainedPerGame = function () {
  var basePt = ScoreMatch.basePt[this.difficulty];
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
  var $difficulty = $($("#difficulty option:selected")[0]);
  var $expectedScore = $($("#score option:selected")[0]);
  var $expectedRanking = $($("#ranking option:selected")[0]);

  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;

  var difficulty = parseInt($difficulty.val());
  var expectedScore = parseInt($expectedScore.val());
  var expectedRanking = parseInt($expectedRanking.val());

  var currentPt = parseInt($currentPt.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var endDatetime = $endDatetime.val();

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
