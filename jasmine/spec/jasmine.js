$(function() {

  describe('User', function() {

    describe('Rank Up Exp', function() {

      it('is correct if rank > 100', function() {
        var user = new User(158, 3290, 59, 2376, 600000);
        expect(user.getRankUpExp()).toBe(4892);
      });

      it('is correct if rank < 100', function() {
        var user = new User(99, 0, 0, 0, 0);
        expect(user.getRankUpExp()).toBe(1430);
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
