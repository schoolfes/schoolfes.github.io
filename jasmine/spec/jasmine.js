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

  describe('Score Match', function() {

    it('is defined', function() {
      expect(MedelyFestival).toBeDefined();
    });

    describe('User statue at the end', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var scoreMatch = new ScoreMatch(Date.now() + weekInMinutes,
        'Hard', 'C', '1st');

        user = getFinalUserState(0, user, scoreMatch);

        expect(user.rank).toBe(159);
        expect(user.exp).toBe(3826);
        expect(user.currentPt).toBe(47500);
      });

    });

    describe('Estimated loveca needed', function() {

      it('is correct if taget can be archived', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var scoreMatch = new ScoreMatch(Date.now() + weekInMinutes,
        'Hard', 'A', '1st');

        var lovecaNeeded = getLovecaNeeded(user, scoreMatch);
        expect(lovecaNeeded).toBe(5);
        expect(getFinalUserState(lovecaNeeded - 1, user, scoreMatch).currentPt).toBeLessThan(60000 - 1);
        expect(getFinalUserState(lovecaNeeded, user, scoreMatch).currentPt).toBeGreaterThan(60000);
      });

      it('is correct if taget can\'t be archived because of not enough time given', function() {
        var user = new User(158, 3290, 59, 1000000, 0);
        var scoreMatch = new ScoreMatch(Date.now() + 1000 * 60 * 60,
        'Hard', 'A', '1st');

        var lovecaNeeded = getLovecaNeeded(user, scoreMatch);
        expect(lovecaNeeded).toBe(3);
        expect(getFinalUserState(lovecaNeeded - 1, user, scoreMatch).currentPt).not.toBe(getFinalUserState(lovecaNeeded, user, scoreMatch).currentPt);
        expect(getFinalUserState(lovecaNeeded + 1, user, scoreMatch).currentPt).toBe(getFinalUserState(lovecaNeeded + 2, user, scoreMatch).currentPt);
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

        user = getFinalUserState(0, user, medelyFestival);

        expect(user.rank).toBe(160);
        expect(user.exp).toBe(1190);
        expect(user.currentPt).toBe(53821);
      });

    });

    describe('Estimated loveca needed', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 60000, 20124);
        var medelyFestival = new MedelyFestival(Date.now() + weekInMinutes,
        'Expert', 3, 'S', 'A',
        true, true);

        var lovecaNeeded = getLovecaNeeded(user, medelyFestival);
        expect(lovecaNeeded).toBe(4);
        expect(getFinalUserState(lovecaNeeded - 1, user, medelyFestival).currentPt).toBeLessThan(60000 - 1);
        expect(getFinalUserState(lovecaNeeded, user, medelyFestival).currentPt).toBeGreaterThan(60000);
      });

      it('is correct if taget can\'t be archived because of not enough time given', function() {
        var user = new User(158, 3290, 59, 1000000, 0);
        var medelyFestival = new MedelyFestival(Date.now() + 1000 * 60 * 1,
        'Expert', 3, 'S', 'A',
        true, true);

        var lovecaNeeded = getLovecaNeeded(user, medelyFestival);
        expect(lovecaNeeded).toBe(0);
        expect(getFinalUserState(lovecaNeeded, user, medelyFestival).currentPt).toBe(getFinalUserState(lovecaNeeded + 1, user, medelyFestival).currentPt);
      });

    });

  });

}());
