var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");

var $normalDifficulty = $("#normal-difficulty");
var $normalMultiper = $("#normal-song-multiplier");
var $eventDifficulty = $("#event-difficulty");
var $eventMultiper = $("#event-song-multiplier");
var $expectedScore = $("#score");
var $expectedCombo = $("#combo");

var $currentToken = $("#current-token");
var $currentPt = $("#current-pt");
var $targetPt = $("#target-pt");
var $endDatetime = $("#end-datetime");

$(function() {
  $(".datetimepicker").datetimepicker({
    format: momentFormatString,
    minDate: Date.now(),
    maxDate: Date.now() + twoWeeksInMilliseconds
  });

  $("#normal-difficulty-dropdown-menu li a").click(changeNormalDifficulty);
  $("#normal-song-multiplier-dropdown-menu li a").click(changeNormalMultiper);
  $("#event-difficulty-dropdown-menu li a").click(changeEventDifficulty);
  $("#event-song-multiplier-dropdown-menu li a").click(changeEventMultiper);
  $("#score-dropdown-menu li a").click(changeScore);
  $("#combo-dropdown-menu li a").click(changeCombo);

  $("#sif-calculate").click(showInput);

  if (jpEventEndDateTime.isValid()) {
    $endDatetime.val(jpEventEndDateTime.format(momentFormatString));
  }
});

function changeNormalDifficulty() {
  $normalDifficulty.text($(this).text());
}

function changeNormalMultiper() {
  $normalMultiper.text($(this).text());
}

function changeEventDifficulty() {
  $eventDifficulty.text($(this).text());
}

function changeEventMultiper() {
  $eventMultiper.text($(this).text());
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

var TokenEventUser = function (rank, exp, lp, targetPt, currentPt, currentToken) {

  User.call(this, rank, exp, lp, targetPt, currentPt);

  this.currentToken = currentToken;
};

TokenEventUser.prototype = Object.create(User.prototype);

var TokenEvent = function (endDatetime,
  normalSongDifficulty, normalSongMultiplier, eventSongDifficulty, eventSongMultiplier,
  expectedScore, expectedCombo) {

  Event.call(this, endDatetime);

  this.normalSongDifficulty = normalSongDifficulty;
  this.normalSongMultiplier = normalSongMultiplier;
  this.eventSongDifficulty = eventSongDifficulty;
  this.eventSongMultiplier = eventSongMultiplier;
  this.expectedScore = expectedScore;
  this.expectedCombo = expectedCombo;
};

TokenEvent.prototype = Object.create(Event.prototype);

TokenEvent.prototype.clone = function () {
  return new TokenEvent(Date.now() + this.remainingTimeInMinutes * 1000 * 60,
  this.normalSongDifficulty, this.normalSongMultiplier, this.eventSongDifficulty, this.eventSongMultiplier,
  this.expectedScore, this.expectedCombo);
};

TokenEvent.prototype.getTimeNeededPerGame = function () {
  return timeNeededPerSong;
};

TokenEvent.prototype.getLpNeededPerNormalSong = function () {
  switch (this.normalSongDifficulty) {
    case "Master":
    case "Expert":
    return Event.lpNeededPerSong[0] * this.normalSongMultiplier;
    case "Hard":
    return Event.lpNeededPerSong[1] * this.normalSongMultiplier;
    case "Normal":
    return Event.lpNeededPerSong[2] * this.normalSongMultiplier;
    case "Easy":
    return Event.lpNeededPerSong[3] * this.normalSongMultiplier;
    default:
    // TODO: error handing
  }
};

TokenEvent.prototype.getPtGainedPerEventSong = function () {
  var ptArray = TokenEvent.eventSongPt[this.eventSongDifficulty];
  var score;
  var combo;

  switch (this.expectedScore) {
    case "S":
    score = 0;
    break;
    case "A":
    score = 1;
    break;
    case "B":
    score = 2;
    break;
    case "C":
    score = 3;
    break;
    default:
    score = 4;
  }

  switch (this.expectedCombo) {
    case "S":
    combo = 0;
    break;
    case "A":
    combo = 1;
    break;
    case "B":
    combo = 2;
    break;
    case "C":
    combo = 3;
    break;
    default:
    combo = 4;
  }

  return ptArray[score][combo] * this.eventSongMultiplier;
};

TokenEvent.prototype.getExpGainedPerEventSong = function () {
  return Event.getExpGainedPerSong(this.eventSongDifficulty) * this.eventSongMultiplier;
};

TokenEvent.prototype.getPtGainedPerNormalSong = function () {
  var ptGained = 0;
  switch (this.normalSongDifficulty) {
    case "Master":
    case "Expert":
    ptGained = TokenEvent.normalSongPt[0];
    break;
    case "Hard":
    ptGained = TokenEvent.normalSongPt[1];
    break;
    case "Normal":
    ptGained = TokenEvent.normalSongPt[2];
    break;
    case "Easy":
    ptGained = TokenEvent.normalSongPt[3];
    break;
    default:
    // TODO: error handling
  }

  return Math.round(ptGained * this.normalSongMultiplier);
};

TokenEvent.prototype.getExpGainedPerNormalSong = function () {
  return Event.getExpGainedPerSong(this.normalSongDifficulty) * this.normalSongMultiplier;
};

TokenEvent.prototype.play = function (user) {
  Event.prototype.play.call(this, user);

  // TODO we can play a sone with lp or token, so we need to override this method
};

TokenEvent.prototype.run = function (loveca, user) {
  Event.prototype.run.call(this, loveca, user);

  // TODO we can play a sone with lp or token, so we need to override this method
};

TokenEvent.normalSongPt = [
  27, 16, 10, 5
]

TokenEvent.eventSongPt = {
  "Expert" : [
    [565, 549, 518, 508, 498],
    [540, 525, 495, 485, 475],
    [509, 495, 467, 458, 448],
    [484, 470, 444, 435, 426],
    [459, 446, 421, 413, 403]
  ],
  "Hard": [
    [261, 254, 246, 241, 237],
    [249, 242, 235, 230, 226],
    [237, 231, 224, 220, 215],
    [226, 219, 213, 209, 204],
    [214, 207, 202, 197, 194]
  ],
  "Normal": [
    [148, 145, 143, 140, 137],
    [143, 140, 137, 135, 133],
    [137, 135, 132, 129, 125],
    [131, 128, 126, 123, 121],
    [124, 122, 120, 117, 114]
  ],
  "Easy": [
    [71, 70, 69, 67, 66],
    [70, 68, 66, 65, 64],
    [68, 66, 65, 64, 63],
    [64, 63, 62, 61, 60],
    [61,60, 59, 58, 57]
  ]
}

function showLovecaNeeded() {
  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;

  var normalDifficulty = $normalDifficulty.text();
  var normalMultiper = parseInt($normalMultiper.text()) || 0;
  var eventDifficulty = $eventDifficulty.text();
  var eventMultiper = parseInt($eventMultiper.text()) || 0;
  var expectedScore = $expectedScore.text();
  var expectedCombo = $expectedCombo.text();

  var currentToken = parseInt($currentToken.val()) || 0;
  var currentPt = parseInt($currentPt.val()) || 0;
  var targetPt = parseInt($targetPt.val()) || 0;
  var endDatetime = $endDatetime.val();

  var user = new TokenEventUser(currentRank, currentExp, currentLp, targetPt, currentPt, currentToken);
  setHasError($currentRank, (user.rank < 1));

  var tokenEvent = new TokenEvent(Date.parse(endDatetime),
  normalDifficulty, normalMultiper, eventDifficulty, eventMultiper,
  expectedScore, expectedCombo);
  // the event should not be ended, or has duration longer then 2 weeks
  setHasError($endDatetime, !(0 < tokenEvent.remainingTimeInMinutes && tokenEvent.remainingTimeInMinutes <= twoWeeksInMinutes));
  if (errorTicket === true) {
    return;
  }

  // TODO show loveca needed
}
