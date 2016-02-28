describe('Weather Spec', function() {
	'use strict';

	var w, zip, results = null;

	beforeEach(function() {
		w = new Weather();
	});

	describe('when using a valid zip code', function() {

		beforeEach(function(done) {
			w.getWeatherByZip('SW1A').then(function(data) {
				results = data;
				done();
			});
		});

		it ('should return results', function() {
			expect(results).not.toBe(null);
		});
	});

	describe('when using an invalid zip code', function() {

		beforeEach(function(done) {
			w.getWeatherByZip('2319023190283').then(function(data) {
				results = data;
				done();
			});
		});

		it ('should return an error message', function() {
			expect(results.message).not.toBe(undefined);
			expect(results.message).not.toBe(null);
		});
	});

	describe('when using no zip code', function() {

		beforeEach(function(done) {
			w.getWeatherByZip('').then(function(data) {
				results = data;
				done();
			});
		});

		it ('should return an error message', function() {
			console.log(results.message);
			expect(results.message).not.toBe(undefined);
			expect(results.message).not.toBe(null);
		});
	});
});