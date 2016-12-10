$(function() {

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

  });

  describe('Medely Festival', function() {

    it('is defined', function() {
      expect(MedelyFestival).toBeDefined();
    });

  });

}());
