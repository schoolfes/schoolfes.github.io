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
  return new MedelyFestival(Date.now() + this.remainingTimeInMinutes * 1000 * 60,
    this.difficulty, this.numSongsPerLive, this.expectedScore, this.expectedCombo,
    this.useExpUp, this.usePtUp);
};

MedelyFestival.prototype.getTimeNeededPerGame = function () {
  return this.numSongsPerLive * timeNeededPerSong;
};

MedelyFestival.prototype.getLpNeededPerGame = function () {
  switch (this.difficulty) {
    case "Expert":
    return MedelyFestival.lpNeededPerSong[0] * this.numSongsPerLive;
    case "Hard":
    return MedelyFestival.lpNeededPerSong[1] * this.numSongsPerLive;
    case "Normal":
    return MedelyFestival.lpNeededPerSong[2] * this.numSongsPerLive;
    case "Easy":
    return MedelyFestival.lpNeededPerSong[3] * this.numSongsPerLive;
    default:
    // TODO: error handing
  }
};

MedelyFestival.prototype.getScoreBonus = function () {
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

MedelyFestival.prototype.getComboBonus = function () {
  switch (this.expectedCombo) {
    case "S":
    return Event.comboBonus[0];
    case "A":
    return Event.comboBonus[1];
    case "B":
    return Event.comboBonus[2];
    case "C":
    return Event.comboBonus[3];
    default:
    return Event.comboBonus[4];
  }
};

MedelyFestival.prototype.getPtGainedPerGame = function () {
  var basePt = 0;
  switch (this.difficulty) {
    case "Expert":
    basePt = MedelyFestival.basePt[0][this.numSongsPerLive];
    break;
    case "Hard":
    basePt = MedelyFestival.basePt[1][this.numSongsPerLive];
    break;
    case "Normal":
    basePt = MedelyFestival.basePt[2][this.numSongsPerLive];
    break;
    case "Easy":
    basePt = MedelyFestival.basePt[3][this.numSongsPerLive];
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
  var baseExp = Event.getExpGainedPerSong(this.difficulty);
  if (this.expUp === true) {
    baseExp *= 1.1;
  }
  return Math.round(baseExp * this.numSongsPerLive);
};

MedelyFestival.basePt = [
  [0, 241, 500, 777],
  [0, 126, 262, 408],
  [0, 72, 150, 234],
  [0, 36, 64, 99]
];

MedelyFestival.lpNeededPerSong = [
  20, 12, 8, 4
];

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

  var medelyFestival = new MedelyFestival(Date.parse(endDatetime),
  difficulty, numSongsPerLive, expectedScore, expectedCombo,
  useExpUp, usePtUp);
  setHasError($numSongsPerGame, !(1 <= numSongsPerLive && numSongsPerLive <= 3));
  // the event should not be ended, or has duration longer then 2 weeks
  setHasError($endDatetime, !(0 < medelyFestival.remainingTimeInMinutes && medelyFestival.remainingTimeInMinutes <= twoWeeksInMinutes));

  if (errorTicket === true) {
    return;
  }

  var loveca = getLovecaNeeded(user, medelyFestival);
  medelyFestival.run(loveca, user);

  var message = "Loveca needed = " + loveca + "\n" +
  "==========\n" +
  "Final Rank: " + user.rank + "\n" +
  "Final Exp = " + user.exp + "\n"  +
  "Final Pt = " + user.currentPt + "\n";

  window.alert(message);
}
