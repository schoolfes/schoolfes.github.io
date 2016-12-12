var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");

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

  $("#sif-calculate").click(showInput);

  if (jpEventEndDateTime.isValid()) {
    $endDatetime.val(jpEventEndDateTime.format(momentFormatString));
  }
});

function showInput() {
  errorTicket = false;
  showLovecaNeeded();
}

var TokenEventUser = function (rank, exp, lp, targetPt, currentPt, currentToken) {

  User.call(this, rank, exp, lp, targetPt, currentPt);

  this.currentToken = currentToken;
};

TokenEventUser.prototype = Object.create(User.prototype);

TokenEventUser.prototype.clone = function () {
  return new TokenEventUser(this.rank, this.exp, this.lp, this.targetPt, this.currentPt, this.currentToken);
};

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
  return Event.lpNeededPerSong[this.normalSongDifficulty] * this.normalSongMultiplier;
};

TokenEvent.prototype.getTokenNeededPerEventSong = function () {
  return TokenEvent.tokenNeededPerSong[this.normalSongDifficulty] * this.eventSongMultiplier;
};

TokenEvent.prototype.getPtGainedPerEventSong = function () {
  var ptArray = TokenEvent.eventSongPt[this.eventSongDifficulty];
  return ptArray[this.expectedScore][this.expectedCombo] * this.eventSongMultiplier;
};

TokenEvent.prototype.getExpGainedPerEventSong = function () {
  return Event.getExpGainedPerSong(this.eventSongDifficulty) * this.eventSongMultiplier;
};

TokenEvent.prototype.getPtGainedPerNormalSong = function () {
  var ptGained = TokenEvent.normalSongPt[this.normalSongDifficulty];
  return Math.round(ptGained * this.normalSongMultiplier);
};

TokenEvent.prototype.getTokenGainedPerNormalSong = function () {
  var tokenGained = TokenEvent.normalSongToken[0];
  return Math.round(tokenGained * this.normalSongMultiplier);
};

TokenEvent.prototype.getExpGainedPerNormalSong = function () {
  return Event.getExpGainedPerSong(this.normalSongDifficulty) * this.normalSongMultiplier;
};

TokenEvent.prototype.run = function (loveca, user) {

  if (this.remainingTimeInMinutes < this.getTimeNeededPerGame() ||
  (user.getMaxLP() < this.getLpNeededPerNormalSong() &&
  user.currentToken < this.getTokenNeededPerEventSong())) {
    // Have no more time for a game
    return;
  }

  if (user.lp >= this.getLpNeededPerNormalSong()) {
    // Have enough lp to play a normal song
    this.remainingTimeInMinutes -= this.getTimeNeededPerGame();
    user.lp -= this.getLpNeededPerNormalSong();
    user.lp += this.getLpGain(this.getTimeNeededPerGame());
    user.currentPt += this.getPtGainedPerNormalSong();
    user.currentToken += this.getTokenGainedPerNormalSong();
    user.exp += this.getExpGainedPerNormalSong();

    if (user.exp >= user.getRankUpExp()) {
      // Rank up!
      user.exp -= user.getRankUpExp();
      user.rank += 1;
      // lpAdded += user.getMaxLP();
      user.lp += user.getMaxLP();
    }

    return this.run(loveca, user);
  } else if (user.currentToken > this.getTokenNeededPerEventSong()) {
    // Have enough lp to play a event song
    this.remainingTimeInMinutes -= this.getTimeNeededPerGame();
    user.currentToken -= this.getTokenNeededPerEventSong();
    user.lp += this.getLpGain(this.getTimeNeededPerGame());
    user.currentPt += this.getPtGainedPerEventSong();
    user.exp += this.getExpGainedPerEventSong();

    if (user.exp >= user.getRankUpExp()) {
      // Rank up!
      user.exp -= user.getRankUpExp();
      user.rank += 1;
      // lpAdded += user.getMaxLP();
      user.lp += user.getMaxLP();
    }

    return this.run(loveca, user);
  } else if (loveca > 0) {
    // Spend a loveca
    user.lp += user.getMaxLP();
    loveca -= 1;
    return this.run(loveca, user);
  } else if (this.remainingTimeInMinutes >= getRecoveryTime(this.getLpNeededPerNormalSong() - user.lp)) {
    // Wait for lp recovery
    var recoveryTime = getRecoveryTime(this.getLpNeededPerNormalSong() - user.lp)
    this.remainingTimeInMinutes -= recoveryTime;
    user.lp += this.getLpGain(recoveryTime);
    return this.run(loveca, user);
  } else {
    // we have no chance to gain enough lp for a new game
    return;
  }
};

TokenEvent.normalSongPt = [
  27, 16, 10, 5
]

TokenEvent.normalSongToken = [
  27, 16, 10, 5
]

TokenEvent.eventSongPt = [
  [
    [565, 549, 518, 508, 498],
    [540, 525, 495, 485, 475],
    [509, 495, 467, 458, 448],
    [484, 470, 444, 435, 426],
    [459, 446, 421, 413, 403]
  ],
  [
    [261, 254, 246, 241, 237],
    [249, 242, 235, 230, 226],
    [237, 231, 224, 220, 215],
    [226, 219, 213, 209, 204],
    [214, 207, 202, 197, 194]
  ],
  [
    [148, 145, 143, 140, 137],
    [143, 140, 137, 135, 133],
    [137, 135, 132, 129, 125],
    [131, 128, 126, 123, 121],
    [124, 122, 120, 117, 114]
  ],
  [
    [71, 70, 69, 67, 66],
    [70, 68, 66, 65, 64],
    [68, 66, 65, 64, 63],
    [64, 63, 62, 61, 60],
    [61,60, 59, 58, 57]
  ]
];

TokenEvent.tokenNeededPerSong = [
  75, 45, 30, 15
];

function showLovecaNeeded() {
  var $normalDifficulty = $($("#normal-difficulty option:selected")[0]);
  var $normalMultiper = $($("#normal-song-multiplier option:selected")[0]);
  var $eventDifficulty = $($("#event-difficulty option:selected")[0]);
  var $eventMultiper = $($("#event-song-multiplier option:selected")[0]);
  var $expectedScore = $($("#score option:selected")[0]);
  var $expectedCombo = $($("#combo option:selected")[0]);

  var currentRank = parseInt($currentRank.val()) || 0;
  var currentExp = parseInt($currentExp.val()) || 0;
  var currentLp = parseInt($currentLp.val()) || 0;

  var normalDifficulty = parseInt($normalDifficulty.val());
  var normalMultiper = parseInt($normalMultiper.val());
  var eventDifficulty = parseInt($eventDifficulty.val());
  var eventMultiper = parseInt($eventMultiper.val());
  var expectedScore = parseInt($expectedScore.val());
  var expectedCombo = parseInt($expectedCombo.val());

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

  var loveca = getLovecaNeeded(user, tokenEvent);
  tokenEvent.run(loveca, user);

  if (errorTicket == false) {
    var message = "Loveca needed = " + loveca + "\n" +
    "==========\n" +
    "Final Rank: " + user.rank + "\n" +
    "Final Exp = " + user.exp + "\n"  +
    "Final Pt = " + user.currentPt + "\n" +
    "Final Token = " + user.currentToken + "\n";

    window.alert(message);
  }
}
