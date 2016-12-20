var jpEventEndDateTime = moment("12/31/2016 03:00 PM GMT+0900");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");

var $numRoundsPerGame = $("#num-songs");
var $useExpUp = $("#exp-up");
var $usePtUp = $("#pt-up");

var $currentRound = $("#current-round");
var $notRedeemedPt = $("#not-redeemed-pt");
var $notRedeemedExp = $("#not-redeemed-exp");
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
  $("#combo-dropdown-menu li a").click(changeCombo);

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

function changeCombo() {
  $expectedCombo.text($(this).text());
}

function showInput() {
  errorTicket = false;
  showLovecaNeeded();
}


var ChallengeFestival = function (endDatetime,
  difficulty, numRoundsPerGame, expectedScore, expectedCombo,
  currentRound, notRedeemedPt, notRedeemedExp,
  useExpUp, usePtUp) {

  Event.call(this, endDatetime);

  this.difficulty = difficulty;
  this.numRoundsPerGame = numRoundsPerGame;
  this.expectedScore = expectedScore;
  this.expectedCombo = expectedCombo;

  this.currentRound = currentRound;
  this.notRedeemedPt = notRedeemedPt;
  this.notRedeemedExp = notRedeemedExp;

  this.useExpUp = useExpUp;
  this.usePtUp = usePtUp;
};

ChallengeFestival.prototype = Object.create(Event.prototype);

ChallengeFestival.prototype.clone = function () {
  return new ChallengeFestival(Date.now() + this.remainingTimeInMinutes * 1000 * 60,
    this.difficulty, this.numRoundsPerGame, this.expectedScore, this.expectedCombo,
    this.currentRound, this.notRedeemedPt, this.notRedeemedExp,
    this.useExpUp, this.usePtUp);
};

ChallengeFestival.prototype.getTimeNeededPerGame = function () {
  return timeNeededPerSong;
};

ChallengeFestival.prototype.getLpNeededPerGame = function () {
  return Event.lpNeededPerSong[this.difficulty];
};

ChallengeFestival.prototype.getScoreBonus = function () {
  return Event.scoreBonus[this.expectedScore];
};

ChallengeFestival.prototype.getComboBonus = function () {
  return Event.comboBonus[this.expectedCombo];
};

ChallengeFestival.prototype.getPtGainedPerGame = function () {
  var ptGained = ChallengeFestival.basePt[this.difficulty][this.currentRound];

  if (this.usePtUp === true) {
    ptGained *= 1.1;
  }

  ptGained *= this.getScoreBonus() * this.getComboBonus();

  if (this.currentRound >= this.numRoundsPerGame) {
    var result = this.notRedeemedPt + Math.round(ptGained);
    this.notRedeemedPt = 0;
    return result;
  } else {
    this.notRedeemedPt += Math.round(ptGained);
    return 0;
  }
};

ChallengeFestival.prototype.getExpGainedPerGame = function () {
  var expGained = Event.getExpGainedPerSong(this.difficulty);
  if (this.expUp === true) {
    expGained *= 1.1;
  }

  if (this.currentRound >= this.numRoundsPerGame) {
    var result = this.notRedeemedExp + Math.round(expGained);
    this.notRedeemedExp = 0;
    return result;
  } else {
    this.notRedeemedExp += Math.round(expGained);
    return 0;
  }
};

ChallengeFestival.prototype.run = function (loveca, user) {
  if (this.remainingTimeInMinutes < this.getTimeNeededPerGame() || user.getMaxLP() < this.getLpNeededPerGame()) {
    // Have no more time for a game
    user.currentPt += this.notRedeemedPt;
    user.exp += this.notRedeemedExp;

    return;
  }

  if (user.lp >= this.getLpNeededPerGame()) {
    // Have a game
    this.remainingTimeInMinutes -= this.getTimeNeededPerGame();
    user.lp -= this.getLpNeededPerGame();
    user.lp += this.getLpGain(this.getTimeNeededPerGame());
    user.currentPt += this.getPtGainedPerGame();
    user.exp += this.getExpGainedPerGame();

    if (user.exp >= user.getRankUpExp()) {
      // Rank up!
      user.exp -= user.getRankUpExp();
      user.rank += 1;
      // lpAdded += user.getMaxLP();
      user.lp += user.getMaxLP();
    }

    this.currentRound++;
    if (this.currentRound > this.numRoundsPerGame) {
      this.currentRound = 1;
    }

    return this.run(loveca, user);
  } else if (loveca > 0) {
    // Spend a loveca
    user.lp += user.getMaxLP();
    loveca -= 1;
    return this.run(loveca, user);
  } else if (this.remainingTimeInMinutes >= getRecoveryTime(this.getLpNeededPerGame() - user.lp)) {
    // Wait for lp recovery
    var recoveryTime = getRecoveryTime(this.getLpNeededPerGame() - user.lp)
    this.remainingTimeInMinutes -= recoveryTime;
    user.lp += this.getLpGain(recoveryTime);
    return this.run(loveca, user);
  } else {
    // we have no chance to gain enough lp for a new game
    user.currentPt += this.notRedeemedPt;
    user.exp += this.notRedeemedExp;

    return;
  }
};

ChallengeFestival.basePt = [
  [0, 301, 320, 339, 358, 377],
  [0, 158, 164, 170, 176, 182],
  [0, 91, 94, 97, 100, 103],
  [0, 39, 40, 41, 42, 43]
]

function showLovecaNeeded() {
  var $difficulty = $($("#difficulty option:selected")[0]);
  var $expectedScore = $($("#score option:selected")[0]);
  var $expectedCombo = $($("#combo option:selected")[0]);

  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;

  var difficulty = parseInt($difficulty.val());
  var numRoundsPerGame = parseInt($numRoundsPerGame.val()) || 0;
  var expectedScore = parseInt($expectedScore.val());
  var expectedCombo = parseInt($expectedCombo.val());
  var useExpUp = $useExpUp.is(":checked");
  var usePtUp = $usePtUp.is(":checked");

  var currentRound = parseInt($currentRound.val()) || 1;
  var notRedeemedPt = parseInt($notRedeemedPt.val()) || 0;
  var notRedeemedExp = parseInt($notRedeemedExp.val()) || 0;
  var currentPt = parseInt($currentPt.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var endDatetime = $endDatetime.val();

  var user = new User(currentRank, currentExp, currentLp, targetPt, currentPt);
  setHasError($currentRank, (user.rank < 1));

  var challengeFestival = new ChallengeFestival(Date.parse(endDatetime),
  difficulty, numRoundsPerGame, expectedScore, expectedCombo,
  currentRound, notRedeemedPt, notRedeemedExp,
  useExpUp, usePtUp);
  setHasError($numRoundsPerGame, !(1 <= numRoundsPerGame && numRoundsPerGame <= 5));
  // the event should not be ended, or has duration longer then 2 weeks
  setHasError($endDatetime, !(0 < challengeFestival.remainingTimeInMinutes && challengeFestival.remainingTimeInMinutes <= twoWeeksInMinutes));

  if (errorTicket === true) {
    return;
  }

  var loveca = getLovecaNeeded(user, challengeFestival);
  challengeFestival.run(loveca, user);

  var message = "Loveca needed = " + loveca + "\n" +
  "==========\n" +
  "Final Rank: " + user.rank + "\n" +
  "Final Exp = " + user.exp + "\n"  +
  "Final Pt = " + user.currentPt + "\n";

  window.alert(message);
}
