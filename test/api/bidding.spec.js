var request = require('request');
var testUtils = require('../utils');
var io = require('socket.io-client');
var socketURL = 'localhost:5000';

var options = {
	transports: ['websocket'],
	'force new connection': true
};

describe('bidding.spec.js', function () {
	var apiUrl, url, response, result, payload, error;

	beforeEach(function () {
		apiUrl = testUtils.getRootUrl() + '/api';
	});

	beforeEach(function (done) {
		testUtils.createTestItem(function(err, item) {
			item = item;
			done(err);
		});
	});

	afterEach(function (done) {
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

		describe('and id is ok', function () {
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

		describe('and user successfully connected to socket', function () {
			var userName = '';

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

			beforeEach(function (done) {
				var client1 = io.connect('http://127.0.0.1:5000');
				client1.on('connect', function (data) {
					client1.emit('join', 'Tom');
				});

				var client2 = io.connect('http://127.0.0.1:5000');
				client2.on('new:user', function (name) {
					userName = name;
					client1.disconnect();
					client2.disconnect();
					done();
				});
			});

			it('should broadcast new user to all connected users', function () {
				expect(userName).to.equal('Tom');
			});
		});
	});

	describe('When user wants to place a new bid', function () {
		describe('and the bid is missed', function () {
			beforeEach(function () {
				payload = {};
			});

			beforeEach(function () {
				url = apiUrl + '/auction/' + 'ryrGV6';
			});

			beforeEach(function (done) {
				request.post({url: url, body: payload, json:true}, function (err, res, body) {
					response = res;
					body = body;
					error = err;
					done(err);
				});
			});

			it('should return 400 (Bad Request)', function (){
				expect(response.statusCode).to.equal(400);
			});
		});

		describe('and the bid is ok', function () {
			beforeEach(function () {
				payload = { bid: '50' };
			});

			beforeEach(function () {
				url = apiUrl + '/auction/' + 'ryrGV6';
			});

			beforeEach(function (done) {
				request.post({url: url, body: payload, json:true}, function (err, res, body) {
					response = res;
					result = body;
					error = err;
					done(err);
				});
			});

			it('should return 200 (Created)', function () {
				expect(response.statusCode).to.equal(200);
			});

			it('should return last placed bid date', function () {
				expect(result.item.lastPlacedBidDate).to.be.ok;
			});

			it('should return last placed bid date', function () {
				expect(result.item.bids.length).to.equal(4);
			});
		});
	});
});