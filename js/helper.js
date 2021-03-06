var User = function (rank, exp, lp, targetPt, currentPt) {
  this.rank = rank;
  this.exp = exp;
  this.lp = lp;

  this.targetPt = targetPt;
  this.currentPt = currentPt;
};

User.prototype.clone = function () {
  return new User(this.rank, this.exp, this.lp, this.targetPt, this.currentPt);
};

User.prototype.getMaxLP = function () {
  var lp = 25;
  for (var i = 1; i <= this.rank; i++) {
    if (i <= 300 && (i % 2) === 0) {
      lp++;
    } else if (i > 300 && (i % 3) === 0) {
      lp++;
    }
  }
  return lp;
};

User.prototype.getRankUpExp = function () {
  if (this.rank >= 100) {
    if (this.rank > 300) {
      return Math.round(34.45 * this.rank) - 551;
    } else {
      return rankUpExp[this.rank];
    }
  } else {
    return Math.round(rankUpExp[this.rank] / 2);
  }
};

var Event = function (endDatetime) {
  this.remainingTimeInMinutes = (endDatetime - Date.now()) / 1000 / 60;
};

Event.prototype.clone = function () {
  return new Event(Date.now() + this.remainingTimeInMinutes * 1000 * 60);
};

Event.prototype.getTimeNeededPerGame = function () {
  // TODO: error hadling
};

Event.prototype.getLpNeededPerGame = function () {
  // TODO: error handling
};

Event.prototype.getLpGain = function (time) {
  return time / 6;
}

Event.prototype.getComboBonus = function () {
  switch (this.expectedCombo) {
    case "S":
    return comboBonus[0];
    case "A":
    return comboBonus[1];
    case "B":
    return comboBonus[2];
    case "C":
    return comboBonus[3];
    default:
    return comboBonus[4];
  }
};

Event.prototype.getPtGainedPerGame = function () {
  // TODO: error handling
};

Event.prototype.getExpGainedPerGame = function () {
  // TODO: error handling
};

Event.prototype.run = function (loveca, user) {
  if (this.remainingTimeInMinutes < this.getTimeNeededPerGame() || user.getMaxLP() < this.getLpNeededPerGame()) {
    // Have no more time for a game
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

    return this.run(loveca, user);
  } else if (loveca > 0) {
    // Spend a loveca
    // lpAdded += user.getMaxLP();
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
    return;
  }
};

Event.getExpGainedPerSong = function (difficulty) {
  return Event.baseExp[difficulty];
};

Event.scoreBonus = [
  1.20, 1.15, 1.10, 1.05, 1.00
];

Event.comboBonus = [
  1.08, 1.06, 1.04, 1.02, 1.00
];

Event.lpNeededPerSong = [
  25, 15, 10, 5
];

Event.baseExp = [
  83, 46, 26, 12
]

var getLovecaNeeded = function (user, event) {
  var maxFinalPt = -1;
  var loveca = 0;

  while (true) {
    // console.log("new trial");
    var clonedUser = user.clone();
    var clonedEvent = event.clone();

    clonedEvent.run(loveca, clonedUser);

    if (clonedUser.currentPt <= maxFinalPt) {
      if (loveca > 0) {
        // there is no diffence betweeen this trial and previous trial,
        // which means the extra loveca used in this trial is redundant.
        loveca--;
      }
      break;
    }

    maxFinalPt = clonedUser.currentPt;
    if (maxFinalPt >= clonedUser.targetPt) {
      break;
    } else {
      loveca++;
    }
  }

  return loveca;
};

var rankUpExp = [
  0, 11, 13, 16, 20, 26, 32, 39, 48, 57,
  67, 79, 91, 105, 120, 135, 152, 170, 189, 208,
  229, 251, 274, 298, 323, 349, 376, 405, 434, 464,
  495, 528, 561, 596, 620, 655, 689, 724, 758, 792,
  827, 861, 896, 931, 965, 1000, 1034, 1068, 1103, 1137,
  1171, 1205, 1241, 1275, 1309, 1344, 1378, 1413, 1447, 1482,
  1516, 1550, 1585, 1620, 1654, 1688, 1722, 1757, 1791, 1826,
  1860, 1894, 1930, 1964, 1998, 2032, 2067, 2101, 2136, 2170,
  2205, 2239, 2274, 2308, 2343, 2377, 2412, 2446, 2480, 2515,
  2549, 2584, 2618, 2652, 2687, 2722, 2756, 2790, 2825, 2860,
  2894, 2929, 2963, 2998, 3032, 3066, 3101, 3135, 3170, 3204,
  3239, 3273, 3307, 3341, 3376, 3410, 3446, 3480, 3514, 3548,
  3583, 3618, 3652, 3687, 3721, 3756, 3790, 3825, 3858, 3893,
  3928, 3962, 3996, 4031, 4065, 4100, 4134, 4169, 4203, 4237,
  4272, 4306, 4341, 4375, 4409, 4445, 4479, 4514, 4548, 4582,
  4616, 4651, 4686, 4720, 4754, 4789, 4823, 4858, 4892, 4927,
  4961, 4996, 5030, 5064, 5099, 5134, 5168, 5202, 5237, 5271,
  5306, 5340, 5375, 5409, 5444, 5478, 5512, 5547, 5581, 5616,
  5650, 5685, 5719, 5754, 5788, 5822, 5857, 5891, 5926, 5960,
  5994, 6029, 6063, 6098, 6132, 6167, 6201, 6236, 6270, 6305,
  6339, 6373, 6408, 6442, 6477, 6511, 6546, 6580, 6614, 6650,
  6684, 6718, 6752, 6787, 6821, 6856, 6890, 6925, 6959, 6994,
  7029, 7062, 7097, 7132, 7166, 7201, 7235, 7270, 7304, 7339,
  7373, 7407, 7441, 7476, 7511, 7545, 7580, 7614, 7648, 7683,
  7717, 7752, 7786, 7820, 7855, 7890, 7924, 7959, 7993, 8028,
  8062, 8097, 8131, 8165, 8200, 8234, 8268, 8303, 8337, 8371,
  8406, 8440, 8475, 8510, 8544, 8579, 8613, 8647, 8682, 8716,
  8751, 8786, 8820, 8855, 8889, 8923, 8958, 8992, 9026, 9061,
  9095, 9129, 9164, 9198, 9233, 9267, 9302, 9336, 9371, 9406,
  9440, 9474, 9509, 9543, 9578, 9612, 9646, 9681, 9715, 9750,
  9785];

// assume that the duration of each song is 3 min
var timeNeededPerSong = 3;

var getRecoveryTime = function (lp) {
  return lp * 6;
};

var errorTicket = false;
function setHasError(inputElement, hasError) {
  if (hasError) {
    errorTicket = true;
    inputElement.parents(".form-group").addClass("has-error has-feedback");
  } else {
    inputElement.parents(".form-group").removeClass("has-error has-feedback");
  }
}

var momentFormatString = "MM/DD/YYYY HH:mm";
var twoWeeksInMinutes = 60 * 24 * 14;
var twoWeeksInMilliseconds = 1000 * 60 * twoWeeksInMinutes;
