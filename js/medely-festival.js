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
  showLovecaNeeded(user, medelyFestival);
}

var medelyFestival = {
  difficulty: "Expert",
  numSongsPerLive: 3,
  timeSpentPerLive: function() {
    return this.numSongsPerLive * 3;
  },
  score: "S",
  combo: "A",
  expUp: true,
  ptUp: true,
  lpSpentPerLive: function() {
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
    }
  },
  expGainedPerLive: function() {
    var baseExp = 0;
    switch (this.difficulty) {
      case "Expert":
      baseExp = 83;
      break;
      case "Hard":
      baseExp = 46;
      break;
      case "Normal":
      baseExp = 26;
      break;
      case "Easy":
      baseExp = 12;
      break;
      default:
    }
    if (this.expUp === true) {
      baseExp *= 1.1;
    }
    return Math.round(baseExp * this.numSongsPerLive);
  },
  ptGainedPerLive: function() {
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
      }
      break;
      default:
    }
    if (this.ptUp === true) {
      basePt *= 1.1;
    }
    return Math.round(basePt * this.scoreBonus() * this.comboBonus());
  },
  scoreBonus: function() {
    switch (this.score) {
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
  },
  comboBonus: function() {
    switch (this.combo) {
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
  },
  remingingTime: 0
};

function resetUser() {
  user.currentRank = parseInt($("#current-rank").val()) || 0;
  user.currentExp = parseInt($("#current-exp").val()) || 0;
  user.currentLp = parseInt($("#current-lp").val()) || 0;

  user.currentPt = parseInt($("#current-pt").val()) || 0;
  user.targetPt = parseInt($("#target-pt").val()) || 0;

  setHasError($("#current-rank"), (user.currentRank < 1));
  errorTicket = errorTicket || (user.currentRank < 1);
}

function resetMedelyFestival() {
  medelyFestival.difficulty = $("#difficulty").text();
  medelyFestival.numSongsPerLive = parseInt($("#num-songs").val()) || 0;
  medelyFestival.score = $("#score").text();
  medelyFestival.combo = $("#combo").text();
  medelyFestival.expUp = $("#exp-up").is(":checked");
  medelyFestival.ptUp = $("#pt-up").is(":checked");

  medelyFestival.remingingTime = helper.remingingTime($("#end-datetime").val());

  errorTicket = errorTicket || (1 > medelyFestival.numSongsPerLive || medelyFestival.numSongsPerLive > 3);
  setHasError($("#num-songs"), (1 > medelyFestival.numSongsPerLive || medelyFestival.numSongsPerLive > 3));

  errorTicket = errorTicket || (medelyFestival.remingingTime < 0 || isNaN(medelyFestival.remingingTime));
  setHasError($("#end-datetime"), (medelyFestival.remingingTime < 0 || isNaN(medelyFestival.remingingTime)));
}

function showLovecaNeeded(user, medelyFestival) {
  var maxFinalPt = 0;
  var loveca = 0;

  while (true) {
    resetUser();
    resetMedelyFestival();

    if (errorTicket === true) {
      break;
    }

    var proposedMaxFinalPt = finalPt(loveca, user, medelyFestival);
    if (proposedMaxFinalPt <= maxFinalPt) {
      break;
    }

    maxFinalPt = proposedMaxFinalPt;
    if (maxFinalPt >= user.targetPt) {
      break;
    } else {
      loveca++;
    }
  }

  if (errorTicket == false) {
    var message = "Loveca needed = " + loveca + "\n" +
    "==========\n" +
    "Final Rank: " + user.currentRank + "\n" +
    "Final Exp = " + user.currentExp + "\n"  +
    "Final Pt = " + user.currentPt + "\n";

    window.alert(message);
  }
}

function finalPt(numLoveca, user, medelyFestival) {
  if (medelyFestival.remingingTime < medelyFestival.timeSpentPerLive()) {
    // Have no more time for a live
    return user.currentPt;
  }

  if (user.currentLp >= medelyFestival.lpSpentPerLive()) {
    // Have a live
    medelyFestival.remingingTime -= medelyFestival.timeSpentPerLive();
    user.currentLp -= medelyFestival.lpSpentPerLive();
    user.currentPt += medelyFestival.ptGainedPerLive();
    user.currentExp += medelyFestival.expGainedPerLive();

    // TODO handle current rank > 300
    if (user.currentExp >= rankUpExp[user.currentRank]) {
      // Rank up!
      user.currentExp -= rankUpExp[user.currentRank];
      user.currentRank += 1;
      user.currentLp += user.maxLp();
    }

    return finalPt(numLoveca, user, medelyFestival);
  } else if (numLoveca > 0) {
    // Spend a loveca
    user.currentLp += user.maxLp();
    numLoveca -= 1;
    return finalPt(numLoveca, user, medelyFestival);
  } else if (medelyFestival.remingingTime >= helper.recoveryTime(medelyFestival.lpSpentPerLive() - user.currentLp)) {
    // Wait for lp recovery
    medelyFestival.remingingTime -= helper.recoveryTime(medelyFestival.lpSpentPerLive() - user.currentLp);
    user.currentLp = medelyFestival.lpSpentPerLive();
    return finalPt(numLoveca, user, medelyFestival);
  } else {
    return user.currentPt;
  }
}
