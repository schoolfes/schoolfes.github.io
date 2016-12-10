var jpEventEndDateTime = moment("12/15/2016 03:00 PM GMT+0900");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");
var $targetPt = $("#target-pt");
var $currentPt = $("#current-pt");
var $endDatetime = $("#end-datetime");
var $difficulty = $("#difficulty");
var $numSongsPerGame = $("#num-songs");
var $expectedScore = $("#score");
var $expectedCombo = $("#combo");
var $useExpUp = $("#exp-up");
var $usePtUp = $("#pt-up");


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


var MedelyFestival = function (endDatetime,
  difficulty, numSongsPerLive, expectedScore, expectedCombo,
  useExpUp, usePtUp) {

  Event.call(this, endDatetime);

  this.difficulty = difficulty;
  this.numSongsPerLive = numSongsPerLive;
  this.expectedScore = expectedScore;
  this.expectedCombo = expectedCombo;

  this.useExpUp = useExpUp;
  this.usePtUp = usePtUp;
};

MedelyFestival.prototype = Object.create(Event.prototype);

MedelyFestival.prototype.clone = function () {
  return new MedelyFestival(Date.now() / 1000 / 60 + this.remainingTime,
    this.difficulty, this.numSongsPerLive, this.expectedScore, this.expectedCombo,
    this.useExpUp, this.usePtUp);
};

MedelyFestival.prototype.getTimeNeededPerGame = function () {
  return this.numSongsPerLive * timeNeededPerSong;
};

MedelyFestival.prototype.getLpNeededPerGame = function () {
  switch (this.difficulty) {
    case "Expert":
    return 20 * this.numSongsPerLive;
    case "Hard":
    return 12 * this.numSongsPerLive;
    case "Normal":
    return 8 * this.numSongsPerLive;
    case "Easy":
    return 4 * this.numSongsPerLive;
    default:
    // TODO: error handing
  }
};

MedelyFestival.prototype.getScoreBonus = function () {
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

MedelyFestival.prototype.getComboBonus = function () {
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

MedelyFestival.prototype.getPtGainedPerGame = function () {
  var basePt = 0;
  switch (this.difficulty) {
    case "Expert":
    switch (this.numSongsPerLive) {
      case 1:
      basePt = 241;
      break;
      case 2:
      basePt = 500;
      break;
      case 3:
      basePt = 777;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Hard":
    switch (this.numSongsPerLive) {
      case 1:
      basePt = 126;
      break;
      case 2:
      basePt = 262;
      break;
      case 3:
      basePt = 408;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Normal":
    switch (this.numSongsPerLive) {
      case 1:
      basePt = 72;
      break;
      case 2:
      basePt = 150;
      break;
      case 3:
      basePt = 234;
      break;
      default:
      // TODO: error handling
    }
    break;
    case "Easy":
    switch (this.numSongsPerLive) {
      case 1:
      basePt = 36;
      break;
      case 2:
      basePt = 64;
      break;
      case 3:
      basePt = 99;
      break;
      default:
      // TODO: error handling
    }
    break;
    default:
    // TODO: error handling
  }
  if (this.usePtUp === true) {
    basePt *= 1.1;
  }
  return Math.round(basePt * this.getScoreBonus() * this.getComboBonus());
};

MedelyFestival.prototype.getExpGainedPerGame = function () {
  var baseExp = this.getExpGained(this.difficulty);
  if (this.expUp === true) {
    baseExp *= 1.1;
  }
  return Math.round(baseExp * this.numSongsPerLive);
};

function showLovecaNeeded() {
  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var currentPt = parseInt($currentPt.val()) || 0;

  var endDatetime = $endDatetime.val();
  var difficulty = $difficulty.text();
  var numSongsPerLive = parseInt($numSongsPerGame.val()) || 0;
  var expectedScore = $expectedScore.text();
  var expectedCombo = $expectedCombo.text();
  var useExpUp = $useExpUp.is(":checked");
  var usePtUp = $usePtUp.is(":checked");

  var user = new User(currentRank, currentExp, currentLp, targetPt, currentPt);
  setHasError($currentRank, (user.rank < 1));

  var medelyFestival = new MedelyFestival(Date.parse(endDatetime) / 1000 / 60,
  difficulty, numSongsPerLive, expectedScore, expectedCombo,
  useExpUp, usePtUp);
  setHasError($numSongsPerGame, !(1 <= numSongsPerLive && numSongsPerLive <= 3));
  // the event should not be ended, or has duration longer then 2 weeks
  setHasError($endDatetime, !(0 < medelyFestival.remainingTime && medelyFestival.remainingTime <= twoWeeksInMinutes));

  if (errorTicket === true) {
    return;
  }

  var loveca = getLovecaNeeded(user, medelyFestival);
  var finalUserState = getFinalUserState(loveca, user, medelyFestival);

  var message = "Loveca needed = " + loveca + "\n" +
  "==========\n" +
  "Final Rank: " + finalUserState.rank + "\n" +
  "Final Exp = " + finalUserState.exp + "\n"  +
  "Final Pt = " + finalUserState.currentPt + "\n";

  window.alert(message);
}
