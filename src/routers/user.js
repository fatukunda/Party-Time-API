const express = require('express')

const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/users', async(req, res) => {
    // Register a new User
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send( { user, token } )
    } catch (error) {
        res.status.send(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    // Login a registered User
    try {
        const { email, password } = req.body
        const user =  await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users/me', auth, async(req, res) => {
    //View logged in User profile
    res.send(req.user)

})

router.patch('/users/me', auth, async(req, res) => {
    // Edit user profile
    const acceptedEditOptions = ['firstName', 'lastName', 'dob', 'gender', 'phoneNumber', 'email', 'password', 'bio']
    const receivedOptions = Object.keys(req.body)
    const isUpdateOption = receivedOptions.every((option) => acceptedEditOptions.includes(option))
    if (!isUpdateOption) {
        return res.status(400).send({ error: 'Invalid update options'})
    }
    try {
        receivedOptions.forEach(option => req.user[option] = req.body[option])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router