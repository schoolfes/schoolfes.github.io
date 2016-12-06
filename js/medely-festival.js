$(function() {
  $(".datetimepicker").datetimepicker();

  $("#difficulty-dropdown-menu li a").click(changeDifficulty);
  $("#score-dropdown-menu li a").click(changeScore);
  $("#combo-dropdown-menu li a").click(changeCombo);

  $("#sif-calculate").click(showInput);
});

function changeDifficulty() {
  $("#difficulty").text($(this).text());
}

function changeScore() {
  $("#score").text($(this).text());
}

function changeCombo() {
  $("#combo").text($(this).text());
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

MedelyFestival.prototype.getTimeNeededPerGame = function () {
  // assume that the duration of each song is 3 min
  return this.numSongsPerLive * 3;
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
  var maxFinalPt = 0;
  var loveca = 0;

  while (true) {
    var currentRank = parseInt($("#current-rank").val()) || 0;
    var currentExp = parseInt($("#current-exp").val()) || 0;
    var currentLp = parseInt($("#current-lp").val()) || 0;
    var targetPt = parseInt($("#target-pt").val()) || 0;
    var currentPt = parseInt($("#current-pt").val()) || 0;
    var user = new User(currentRank, currentExp, currentLp, targetPt, currentPt);

    setHasError($("#current-rank"), (user.rank < 1));

    var remainingTime = $("#end-datetime").val();
    var difficulty = $("#difficulty").text();
    var numSongsPerLive = parseInt($("#num-songs").val()) || 0;
    var expectedScore = $("#score").text();
    var expectedCombo = $("#combo").text();
    var useExpUp = $("#exp-up").is(":checked");
    var usePtUp = $("#pt-up").is(":checked");

    var medelyFestival = new MedelyFestival(remainingTime,
    difficulty, numSongsPerLive, expectedScore, expectedCombo,
    useExpUp, usePtUp);

    setHasError($("#num-songs"), !(1 <= numSongsPerLive && numSongsPerLive <= 3));
    setHasError($("#end-datetime"), (medelyFestival.remainingTime < 0));

    if (errorTicket === true) {
      break;
    }

    var user = getFinalUserState(loveca, user, medelyFestival);
    if (user.currentPt <= maxFinalPt) {
      break;
    }

    maxFinalPt = user.currentPt;
    if (maxFinalPt >= user.targetPt) {
      break;
    } else {
      loveca++;
    }
  }

  if (errorTicket == false) {
    var message = "Loveca needed = " + loveca + "\n" +
    "==========\n" +
    "Final Rank: " + user.rank + "\n" +
    "Final Exp = " + user.exp + "\n"  +
    "Final Pt = " + user.currentPt + "\n";

    window.alert(message);
  }
}
