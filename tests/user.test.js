const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/User')

const _id = new mongoose.Types.ObjectId()

const testUser1 = {
    _id,
    firstName: 'testUser',
    lastName: 'testUserLast',
    dob: new Date(1990,4, 17),
    email: 'testuser1@app.com',
    password: 'testPass1234!',
    tokens: [{
        token: jwt.sign({ _id }, process.env.JWT_KEY)
    }]
}

const invalidUser = {
    _id,
    firstName: 'testUser',
    lastName: 'testUser2Last',
    email: 'usernone@app.com',
    password: 'userPass12!!'
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(testUser1).save()
})

test('Should signup a new user', async () => {
    const user = {
        firstName: 'testUser',
        lastName: 'testUserlast',
        email: 'testuser@app.com',
        password: 'MyPass2019!'
    }
    await request(app)
        .post('/users')
        .send(user)
        .expect(201)
})

test('Should login a registered user', async () => {
    const { email, password } = testUser1
        await request(app)
        .post('/users/login')
        .send({email, password})
        .expect(201)
})