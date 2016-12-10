$(function() {

  var weekInMinutes = twoWeeksInMilliseconds / 2;

  describe('User', function() {

    describe('Rank Up Exp', function() {

      it('is in range ±2 if cureent rank == 604', function() {
        var user = new User(604, 0, 0, 0, 0);
        expect(user.getRankUpExp()).toBeGreaterThanOrEqual(20258 - 2);
        expect(user.getRankUpExp()).toBeLessThanOrEqual(20258 + 2);
      });

      it('is correct if current rank == 158', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        expect(user.getRankUpExp()).toBe(4892);
      });

      it('is correct if current rank == 99', function() {
        var user = new User(99, 0, 0, 0, 0);
        expect(user.getRankUpExp()).toBe(1430);
      });

      it('is correct if current rank == 1', function() {
        var user = new User(1, 0, 0, 0, 0);
        expect(user.getRankUpExp()).toBe(6);
      });

    });

  });

  describe('Max Lp', function() {

    it('is current if cureent rank == 158', function() {
      var user = new User(158, 0, 0, 0, 0);
      expect(user.getMaxLP()).toBe(104);
    });

  });

  describe('Score Match', function() {

    it('is defined', function() {
      expect(MedelyFestival).toBeDefined();
    });

    describe('User statue at the end', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var scoreMatch = new ScoreMatch(Date.now() + weekInMinutes,
        'Hard', 'C', '1st');

        scoreMatch.run(0, user);

        expect(user.rank).toBe(159);
        expect(user.exp).toBe(4010);
        expect(user.currentPt).toBe(48428);
      });

    });

    describe('Estimated loveca needed', function() {

      it('is correct if taget can be archived', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var clonedUser = user.clone();

        var scoreMatch = new ScoreMatch(Date.now() + weekInMinutes,
        'Hard', 'A', '1st');
        var clonedScoreMatch = scoreMatch.clone();

        var lovecaNeeded = getLovecaNeeded(user, scoreMatch);
        expect(lovecaNeeded).toBe(4);

        scoreMatch.run(lovecaNeeded - 1, user);
        clonedScoreMatch.run(lovecaNeeded, clonedUser);

        expect(user.currentPt).toBeLessThan(60000 - 1);
        expect(clonedUser.currentPt).toBeGreaterThan(60000);
      });

      it('is correct if taget can\'t be archived because of not enough time given', function() {
        var user = new User(158, 3290, 59, 1000000, 0);
        var clonedUser = user.clone();
        var anotherClonedUser = user.clone();

        var scoreMatch = new ScoreMatch(Date.now() + 1000 * 60 * 60,
        'Hard', 'A', '1st');
        var clonedScoreMatch = scoreMatch.clone();
        var anotherClonedScoreMatch = scoreMatch.clone();

        var lovecaNeeded = getLovecaNeeded(user, scoreMatch);
        expect(lovecaNeeded).toBe(3);

        scoreMatch.run(lovecaNeeded - 1, user);
        clonedScoreMatch.run(lovecaNeeded, clonedUser);
        anotherClonedScoreMatch.run(lovecaNeeded + 1, anotherClonedUser);

        expect(user.currentPt).not.toBe(clonedUser.currentPt);
        expect(clonedUser.currentPt).toBe(anotherClonedUser.currentPt);
      });
    });

  });

  describe('Medely Festival', function() {

    it('is defined', function() {
      expect(MedelyFestival).toBeDefined();
    });

    describe('User statue at the end', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var medelyFestival = new MedelyFestival(Date.now() + weekInMinutes,
        'Expert', 3, 'S', 'A',
        true, true);

        medelyFestival.run(0, user);

        expect(user.rank).toBe(160);
        expect(user.exp).toBe(1439);
        expect(user.currentPt).toBe(54908);
      });

    });

    describe('Estimated loveca needed', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var clonedUser = user.clone();

        var medelyFestival = new MedelyFestival(Date.now() + weekInMinutes,
        'Expert', 3, 'S', 'A',
        true, true);
        var clonedMedelyFestival = medelyFestival.clone();

        var lovecaNeeded = getLovecaNeeded(user, medelyFestival);
        expect(lovecaNeeded).toBe(3);

        medelyFestival.run(lovecaNeeded - 1, user);
        clonedMedelyFestival.run(lovecaNeeded, clonedUser);

        expect(user.currentPt).toBeLessThan(60000 - 1);
        expect(clonedUser.currentPt).toBeGreaterThan(60000);
      });

      it('is correct if taget can\'t be archived because of not enough time given', function() {
        var user = new User(158, 3290, 59, 1000000, 0);
        var clonedUser = user.clone();

        var medelyFestival = new MedelyFestival(Date.now() + 1000 * 60 * 1,
        'Expert', 3, 'S', 'A',
        true, true);
        var clonedMedelyFestival = medelyFestival.clone();

        var lovecaNeeded = getLovecaNeeded(user, medelyFestival);
        expect(lovecaNeeded).toBe(0);

        medelyFestival.run(lovecaNeeded, user);
        clonedMedelyFestival.run(lovecaNeeded + 1, clonedUser);

        expect(user.currentPt).toBe(clonedUser.currentPt);
      });

    });

  });

  describe('Challenge Festival', function() {

    it('is defined', function() {
      expect(ChallengeFestival).toBeDefined();
    });

    describe('Pt Gain', function() {

      it('is correct with level expert score S combo A at round 4', function() {
        var challengeFestival = new ChallengeFestival(Date.now() + weekInMinutes,
        'Expert', 4, 'S', 'A',
        4, 0, 0,
        false, false);

        expect(challengeFestival.getPtGainedPerGame()).toBe(455);
      });

      it('is correct with level easy score C combo B at round 5', function() {
        var challengeFestival = new ChallengeFestival(Date.now() + weekInMinutes,
        'Easy', 5, 'C', 'B',
        5, 0, 0,
        false, false);

        expect(challengeFestival.getPtGainedPerGame()).toBe(47);
      });

      it('is correct with level hard score None combo None at round 3', function() {
        var challengeFestival = new ChallengeFestival(Date.now() + weekInMinutes,
        'Hard', 3, 'None', 'None',
        3, 0, 0,
        false, false);

        expect(challengeFestival.getPtGainedPerGame()).toBe(170);
      });
    });

    describe('User statue at the end', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var challengeFestival = new ChallengeFestival(Date.now() + weekInMinutes,
        'Expert', 3, 'S', 'A',
        1, 0, 0,
        true, true);

        challengeFestival.run(0, user);

        expect(user.rank).toBe(159);
        expect(user.exp).toBe(4457);
        expect(user.currentPt).toBe(52777);
      });

    });

    describe('Estimated loveca needed', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var clonedUser = user.clone();

        var challengeFestival = new ChallengeFestival(Date.now() + weekInMinutes,
        'Expert', 3, 'S', 'A',
        1, 0, 0,
        true, true);
        var clonedChallengeFestival = challengeFestival.clone();

        var lovecaNeeded = getLovecaNeeded(user, challengeFestival);
        expect(lovecaNeeded).toBe(3);

        challengeFestival.run(lovecaNeeded - 1, user);
        clonedChallengeFestival.run(lovecaNeeded, clonedUser);

        expect(user.currentPt).toBeLessThan(60000 - 1);
        expect(clonedUser.currentPt).toBeGreaterThan(60000);
      });

      it('is correct if taget can\'t be archived because of not enough time given', function() {
        var user = new User(158, 3290, 59, 1000000, 0);
        var clonedUser = user.clone();
        var anotherClonedUser = user.clone();

        var challengeFestival = new ChallengeFestival(Date.now() + 1000 * 60 * 1,
        'Expert', 3, 'S', 'A',
        1, 0, 0,
        true, true);
        var clonedChallengeFestival = challengeFestival.clone();
        var anotherClonedChallengeFestival = challengeFestival.clone();

        var lovecaNeeded = getLovecaNeeded(user, challengeFestival);
        expect(lovecaNeeded).toBe(0);

        challengeFestival.run(lovecaNeeded, user);
        clonedChallengeFestival.run(lovecaNeeded + 1, clonedUser);

        expect(user.currentPt).toBe(clonedUser.currentPt);
      });

    });

  });
}());
