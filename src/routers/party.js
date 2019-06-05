const express = require('express')
const Party = require('../models/Party')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.post('/me/hosted_parties', auth, async(req, res) => {
    // Create a party to host.
    const party = new Party({
        ...req.body,
        host: req.user._id
    })
    try {
        await party.save()
        res.status(201).send(party)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/me/hosted_parties', auth, async(req, res) => {
    //Get a list of parties I've/I'm hosting
    try {
        await req.user.populate({
            path: 'parties_hosted'
        }).execPopulate()
        res.send(req.user.parties_hosted)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id/hosted_parties', auth, async(req, res) => {
    // Get a list of parties hosted by a given user.
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send({error: 'User not found'})
        }
        await user.populate({
            path: 'parties_hosted'
        }).execPopulate()
        res.send(user.parties_hosted)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id/hosted_parties/:party_id', auth, async(req, res) => {
    const user_id = req.params.id
    const party_id = req.params.party_id
    try {
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).send({error: 'User not found'})
        }
        const party = await Party.findOne({_id: party_id, host: user_id})
        if (!party) {
            return res.status(404).send({error: 'Party not found'})
        }
        res.send(party)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router
