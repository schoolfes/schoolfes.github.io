$(function() {

  var weekInMilliseconds = twoWeeksInMilliseconds / 2;

  describe('User', function() {

    describe('Rank Up Exp', function() {

      it('is in range ±2 if cureent rank == 604', function() {
        var user = new User(604, 0, 0, 0, 0);
        expect(user.getRankUpExp()).toBeGreaterThanOrEqual(20258 - 2);
        expect(user.getRankUpExp()).toBeLessThanOrEqual(20258 + 2);
      });

      it('is correct if current rank == 158', function() {
        var user = new User(158, 3290, 59, 600000, 20124);
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
        var user = new User(158, 3290, 59, 600000, 20124);
        var endDatetime = moment(Date.now() + weekInMilliseconds).format(momentFormatString);
        var scoreMatch = new ScoreMatch(endDatetime.toString(), 'Hard', 'C', '1st');

        user = getFinalUserState(0, user, scoreMatch);

        expect(user.rank).toBe(159);
        expect(user.exp).toBe(3826);
        expect(user.currentPt).toBe(47500);
      });

    });

  });

  describe('Medely Festival', function() {

    it('is defined', function() {
      expect(MedelyFestival).toBeDefined();
    });

    describe('User statue at the end', function() {

      it('is correct', function() {
        var user = new User(158, 3290, 59, 600000, 20124);
        var endDatetime = moment(Date.now() + weekInMilliseconds).format(momentFormatString);
        var medelyFestival = new MedelyFestival(endDatetime.toString(),
        'Expert', 3, 'S', 'A',
        true, true);

        user = getFinalUserState(0, user, medelyFestival);

        expect(user.rank).toBe(160);
        expect(user.exp).toBe(1190);
        expect(user.currentPt).toBe(53821);
      });

    });

  });

}());
