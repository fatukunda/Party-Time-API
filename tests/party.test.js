const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Party = require('../src/models/Party');
const { testUser1, testUser2, party1, party2, populateUser, closeConnection } = require('./fixtures/base');

beforeEach(populateUser);
afterAll(closeConnection);

test('Should create a new party', async () => {
	const newParty = {
		title: 'testParty',
		description: 'test description',
		address: 'test address',
		category: 'other',
	};
	const response = await request(app)
		.post('/me/hosted_parties')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send(newParty)
		.expect(201);
	const party = await Party.findById(response.body._id);
	expect(party).not.toBeNull();
	expect(party.title).toEqual('testParty');
});

test('Should throw a 400 if party title is not given', async () => {
	const invalidParty = {
		description: 'Carry your own drinks and eats',
		address: 'Naguru',
		category: 'house party',
	};
	await request(app)
		.post('/me/hosted_parties')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send(invalidParty)
		.expect(400);
});

test('Should get a list of parties hosted by a logged in user', async () => {
	const response = await request(app)
		.get('/me/hosted_parties')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.expect(200);
	const parties = await Party.find({ host: testUser1._id });
	expect(parties).not.toBeNull();
	expect(response.body.length).toEqual(1);
	expect(response.body[0].title).toEqual('Party on the lake');
});

test('Should get a single party', async () => {
	const response = await request(app)
		.get(`/me/hosted_parties/${party1._id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.expect(200);
	const party = await Party.findById(response.body._id);
	expect(party).not.toBeNull();
	expect(party.title).toEqual('Party on the lake');
});

test('Should not view a party you are not hosting', async () => {
	await request(app)
		.get(`/me/hosted_parties/${party2._id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.expect(404);
});

test('Should edit party details', async () => {
	const response = await request(app)
		.patch(`/me/hosted_parties/${party1._id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send({ title: 'Edited party title' })
		.expect(200);
	const party = await Party.findById(party1._id);
	expect(party.title).toEqual(response.body.title);
});

test('Should throw an error when a party does not exist', async () => {
	const _id = new mongoose.Types.ObjectId();
	await request(app)
		.patch(`/me/hosted_parties/${_id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send({ title: 'Lets party' })
		.expect(404);
});

test('Should delete a party', async () => {
	await request(app)
		.delete(`/me/hosted_parties/${party1._id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.expect(200);
	const party = await Party.findById(party1._id);
	expect(party).toBeNull();
});

test('Should throw an error if party does not exist', async () => {
	const _id = new mongoose.Types.ObjectId();
	const response = await request(app)
		.delete(`/me/hosted_parties/${_id}`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.expect(404);
	expect(response.body.error).toEqual('Party not found');
});

test('Should upload party images', async () => {
	await request(app)
		.post(`/me/hosted_parties/${party2._id}/images`)
		.set('Authorization', `Bearer ${testUser2.tokens[0].token}`)
		.attach('images', 'tests/fixtures/portfolio.png')
		.expect(200);
});

test('Should throw an error if party is not found', async () => {
	const _id = new mongoose.Types.ObjectId();
	await request(app)
		.post(`/me/hosted_parties/${_id}/images`)
		.set('Authorization', `Bearer ${testUser2.tokens[0].token}`)
		.attach('images', 'tests/fixtures/portfolio.png')
		.expect(404);
});
