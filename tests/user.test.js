const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const { invalidUser, testUser1, populateUser, closeConnection } = require('./fixtures/base');

beforeEach(populateUser);

afterAll(closeConnection);

test('Should signup a new user', async () => {
	const newUser = {
		firstName: 'testUser',
		lastName: 'testUserlast',
		email: 'testuser@app.com',
		password: 'MyPass2019!',
	};
	const response = await request(app)
		.post('/users')
		.send(newUser)
		.expect(201);
	// Assert that the user was created in the database
	const user = await User.findById(response.body.user._id);
	expect(user).not.toBeNull();
	//Assertions about the response
	expect(response.body).toMatchObject({
		user: {
			firstName: 'testUser',
			lastName: 'testUserlast',
			email: 'testuser@app.com',
		},
		token: user.tokens[0].token,
	});
	//Assert that the password was not stored in plain text
	expect(user.password).not.toBe('MyPass2019!');
});

test('Should throw a 400 error when a wrong email format is provided', async () => {
	const newUser = {
		firstName: 'testUser3',
		lastName: 'testUserlast3',
		email: 'testuser@app',
		password: 'MyPass2019!',
	};
	await request(app)
		.post('/users')
		.send(newUser)
		.expect(400);
});

test('Should login a registered user', async () => {
	const { email, password } = testUser1;
	const response = await request(app)
		.post('/users/login')
		.send({ email, password })
		.expect(201);
	// Assert that the user is registred
	const user = await User.findById(testUser1._id);
	expect(user).not.toBeNull();
	// Assert that the token in the response matches user's second token
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not log in a non-existent user', async () => {
	const { email, password } = invalidUser;
	await request(app)
		.post('/users/login')
		.send({ email, password })
		.expect(400);
});

test('Should get the user profile', async () => {
	const response = await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
	// Assertions about the response
	expect(response.body).toMatchObject({
		firstName: 'luka',
		lastName: 'modric',
		email: 'lukam@app.com',
	});
});

test('Should not get profile of an unauthenticated user', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401);
});

test('Should delete an account for an authorized user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
	// Assert the user doesn't exist in the database
	const user = await User.findById(testUser1._id);
	expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete('/users/me')
		.send()
		.expect(401);
});

test('Should upload a profile picture', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/portfolio.png')
		.expect(200);
	// Assert that the image was stored in the database as a buffer
	const user = await User.findById(testUser1._id);
	expect(user).not.toBeNull();
	expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should get a given user avatar', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/portfolio.png');
	await request(app)
		.get(`/users/${testUser1._id}/avatar`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Should not get an avatar that is not available', async () => {
	await request(app)
		.get(`/users/${testUser1._id}/avatar`)
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(404);
});

test('Should throw a 400 for an invalid image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.attach('image', 'tests/fixtures/portfolio.png')
		.expect(400);
});

test('Should delete an avatar', async () => {
	await request(app)
		.delete('/users/me/avatar')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Should edit user profile', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send({
			firstName: 'Luka',
			lastName: 'Modric',
		})
		.expect(200);
	const user = await User.findById(testUser1._id);
	expect(user.firstName).toEqual('Luka');
	expect(user.lastName).toEqual('Modric');
});

test('Should not edit profile if unauthorized', async () => {
	await request(app)
		.patch('/users/me')
		.send({
			firstName: 'Luka',
			lastName: 'Modric',
		})
		.expect(401);
});

test('Should not update invalid field options', async () => {
	const response = await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send({
			invalidField: 'Luka',
		})
		.expect(400);
	//Response assertions
	expect(response.body.error).toBe('Invalid update options');
});

test('Should throw a 400 error if new email is invalid', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send({ email: 'admin@app' })
		.expect(400);
});

test('Should log out a user', async () => {
	await request(app)
		.post('/users/me/logout')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Should log user out of all devices', async () => {
	await request(app)
		.post('/users/me/logoutall')
		.set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
		.send()
		.expect(200);
});
