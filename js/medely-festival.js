var jpEventEndDateTime = moment("12/15/2016 03:00 PM GMT+0900");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");

var $numSongsPerGame = $("#num-songs");
var $useExpUp = $("#exp-up");
var $usePtUp = $("#pt-up");

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
  return MedelyFestival.lpNeededPerSong[this.difficulty] * this.numSongsPerLive;
};

MedelyFestival.prototype.getScoreBonus = function () {
  return Event.scoreBonus[this.expectedScore];
};

MedelyFestival.prototype.getComboBonus = function () {
  return Event.comboBonus[this.expectedCombo];
};

MedelyFestival.prototype.getPtGainedPerGame = function () {
  var basePt = MedelyFestival.basePt[this.difficulty][this.numSongsPerLive];

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
  var $difficulty = $($("#difficulty option:selected")[0]);
  var $expectedScore = $($("#score option:selected")[0]);
  var $expectedCombo = $($("#combo option:selected")[0]);

  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;

  var difficulty = parseInt($difficulty.val());
  var numSongsPerLive = parseInt($numSongsPerGame.val()) || 0;
  var expectedScore = parseInt($expectedScore.val());
  var expectedCombo = parseInt($expectedCombo.val());
  var useExpUp = $useExpUp.is(":checked");
  var usePtUp = $usePtUp.is(":checked");

  var currentPt = parseInt($currentPt.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var endDatetime = $endDatetime.val();

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
