var request = require('request');
var testUtils = require('../utils');

describe('bidding.spec.js', function () {
	var apiUrl, url, response, result;

	beforeEach(function () {
		apiUrl = testUtils.getRootUrl() + '/api';
	});

	before(function (done) {
		testUtils.createTestItem(function(err, item) {
			item = item;
			done(err);
		});
	});

	after(function (done) {
		testUtils.clearCollection(function (err) {
			done(err);
		});
	});

	describe('When user access the auction room for specific item', function () {
		describe('and id is wrong', function () {
			beforeEach(function () {
				url = apiUrl + '/auction/' + '1234';
			});

			beforeEach(function (done) {
				request({url: url, json: true}, function (err, resp, body) {
					response = resp;
					result = body;
					done(err);
				});
			});

			it('should respond 404(Not Found)', function () {
				expect(response.statusCode).to.equal(404);
			});
		});

		describe('and id is correct', function () {
			beforeEach(function () {
				url = apiUrl + '/auction/' + 'ryrGV6';
			});

			beforeEach(function (done) {
				request({url: url, json: true}, function (err, resp, body) {
					response = resp;
					result = body;
					done(err);
				});
			});

			it('shoud respond 200 (OK)', function () {
				expect(response.statusCode).to.equal(200);
			});

			it('shoud respond with requested item id', function () {
				expect(result.item.itemId).to.equal('ryrGV6');
			});

			it('shoud respond with a picture of the current item', function () {
				expect(result.item.picture).to.be.ok;
			});

			it('shoud respond with a name of the current item', function () {
				expect(result.item.name).to.be.ok;
			});

			it('shoud respond with a description of the current item', function () {
				expect(result.item.description).to.be.ok;
			});

			it('shoud respond with the current highest bid of the current item', function () {
				expect(result.item.highestBid).to.be.ok;
			});
		});
	});
});