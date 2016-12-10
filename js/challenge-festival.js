var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");
var $targetPt = $("#target-pt");
var $currentPt = $("#current-pt");
var $endDatetime = $("#end-datetime");
var $difficulty = $("#difficulty");

var $numRoundsPerGame = $("#num-songs");
var $expectedScore = $("#score");
var $expectedCombo = $("#combo");
var $useExpUp = $("#exp-up");
var $usePtUp = $("#pt-up");

var $currentRound = $("#current-round");
var $notRedeemedExp = $("#not-redeemed-exp");
var $notRedeemedPt = $("#not-redeemed-pt");

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
  switch (this.difficulty) {
    case "Expert":
    return 25;
    case "Hard":
    return 15;
    case "Normal":
    return 10;
    case "Easy":
    return 5;
    default:
    // TODO: error handing
  }
};

ChallengeFestival.prototype.getScoreBonus = function () {
  switch (this.expectedScore) {
    case "S":
    return 1.20;
    case "A":
    return 1.15;
    case "B":
    return 1.10;
    case "C":
    return 1.05;
    default:
    return 1.00;
  }
};

ChallengeFestival.prototype.getComboBonus = function () {
  switch (this.expectedCombo) {
    case "S":
    return 1.08;
    case "A":
    return 1.06;
    case "B":
    return 1.04;
    case "C":
    return 1.02;
    default:
    return 1.00;
  }
};

ChallengeFestival.prototype.getPtGainedPerGame = function () {
  var ptGained = 0;
  switch (this.difficulty) {
    case "Expert":
    switch (this.currentRound) {
      case 1:
      ptGained = 301;
      break;
      case 2:
      ptGained = 320;
      break;
      case 3:
      ptGained = 339;
      break;
      case 4:
      ptGained = 358;
      break;
      case 5:
      ptGained = 377;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Hard":
    switch (this.currentRound) {
      case 1:
      ptGained = 158;
      break;
      case 2:
      ptGained = 164;
      break;
      case 3:
      ptGained = 170;
      break;
      case 4:
      ptGained = 176;
      break;
      case 5:
      ptGained = 182;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Normal":
    switch (this.currentRound) {
      case 1:
      ptGained = 91;
      break;
      case 2:
      ptGained = 94;
      break;
      case 3:
      ptGained = 97;
      break;
      case 4:
      ptGained = 100;
      break;
      case 5:
      ptGained = 103;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Easy":
    switch (this.currentRound) {
      case 1:
      ptGained = 39;
      break;
      case 2:
      ptGained = 40;
      break;
      case 3:
      ptGained = 41;
      break;
      case 4:
      ptGained = 42;
      break;
      case 5:
      ptGained = 43;
      break;
      default:
      // TODO: error handling
    }
    break;
    default:
    // TODO: error handling
  }
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
  var expGained = this.getExpGained(this.difficulty);
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

function showLovecaNeeded() {
  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var currentPt = parseInt($currentPt.val()) || 0;

  var endDatetime = $endDatetime.val();
  var difficulty = $difficulty.text();
  var numRoundsPerGame = parseInt($numRoundsPerGame.val()) || 0;
  var expectedScore = $expectedScore.text();
  var expectedCombo = $expectedCombo.text();
  var currentRound = parseInt($currentRound.val()) || 1;
  var notRedeemedPt = parseInt($notRedeemedPt.val()) || 0;
  var notRedeemedExp = parseInt($notRedeemedExp.val()) || 0;
  var useExpUp = $useExpUp.is(":checked");
  var usePtUp = $usePtUp.is(":checked");

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
  var finalUserState = getFinalUserState(loveca, user, challengeFestival);

  var message = "Loveca needed = " + loveca + "\n" +
  "==========\n" +
  "Final Rank: " + finalUserState.rank + "\n" +
  "Final Exp = " + finalUserState.exp + "\n"  +
  "Final Pt = " + finalUserState.currentPt + "\n";

  window.alert(message);
}
