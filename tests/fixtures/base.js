const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const Party = require('../../src/models/Party');

const user1_id = new mongoose.Types.ObjectId();

// Create some users
const testUser1 = {
	_id: user1_id,
	firstName: 'luka',
	lastName: 'modric',
	dob: new Date(1990, 4, 17),
	email: 'lukam@app.com',
	password: 'testPass1234!',
	tokens: [
		{
			token: jwt.sign({ _id: user1_id }, process.env.JWT_KEY),
		},
	],
};

const user2_id = new mongoose.Types.ObjectId();

const testUser2 = {
	_id: user2_id,
	firstName: 'Frank',
	lastName: 'Atukunda',
	dob: new Date(1990, 4, 11),
	email: 'admin@app.com',
	password: 'testPass123489!',
	tokens: [
		{
			token: jwt.sign({ _id: user1_id }, process.env.JWT_KEY),
		},
	],
};

const invalidUser = {
	_id: user1_id,
	firstName: 'testUser',
	lastName: 'testUser2Last',
	email: 'usernone@app.com',
	password: 'userPass12!!',
};

// Create some parties
const party1 = {
	_id: new mongoose.Types.ObjectId(),
	title: 'Party on the lake',
	description: 'Lots of eats and drinks',
	address: 'Nyira beach',
	category: 'other',
	host: testUser1._id,
};

const party2 = {
	_id: new mongoose.Types.ObjectId(),
	title: 'A cool house party',
	description: 'Party all night long',
	address: 'Ntinda',
	category: 'house party',
	host: testUser2._id,
};

const party3 = {
	_id: new mongoose.Types.ObjectId(),
	title: 'A memorable birthday',
	description: 'Carry your own drinks',
	address: 'Naguru',
	category: 'house party',
	host: testUser2._id,
};


const populateUser = async () => {
	await User.deleteMany();
	await Party.deleteMany();
	await new User(testUser1).save();
	await new User(testUser2).save();
	await new Party(party1).save();
	await new Party(party2).save();
	await new Party(party3).save();
};

const closeConnection = async done => {
	await mongoose.connection.close(done);
};

module.exports = {
	testUser1,
	testUser2,
	party1,
	party2,
	party3,
	invalidUser,
	populateUser,
	closeConnection,
};
