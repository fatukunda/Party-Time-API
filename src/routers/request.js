const express = require('express')
const auth = require('../middleware/auth')
const Request = require('../models/Request')
const Party = require('../models/Party')

const router = express.Router()

router.post('/parties/:id/requests', auth, async(req, res) => {
    // Make a request to attend a party.
    const partyId = req.params.id
    const request = new Request({
        ...req.body,
        party: partyId,
        requestor: req.user._id
    })
    try {
        await request.save()
        res.status(201).send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/me/requests', auth, async(req, res) => {
    //Get all the party requests I have made.
    try {
        await req.user.populate('user_requests').execPopulate()
        res.send(req.user.user_requests)
    } catch (error) {
        res.send(500).send(error)
    }
})

router.get('/me/requests/:id', auth, async(req, res) => {
    // Get a single party request.
    try {
        const request = await Request.findOne({requestor: req.user._id, _id: req.params.id})
        res.send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/me/parties/:id/requests_received', auth, async(req, res) => {
    // Get a list of requests received from other users.
    try {
        const party = await Party.findOne({_id: req.params.id, host: req.user._id})
        if (!party) {
            return res.status(404).send({error: 'Party not found'})
        }
        await party.populate('party_requests').execPopulate()
        res.send(party.party_requests)
        
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/me/parties/:id/requests_received/:request_id', auth, async(req, res) => {
    // Get a single request received on a hosted party
    try {
        const party = await Party.findOne({_id: req.params.id, host: req.user._id})
        if (!party) {
            return res.status(404).send({error: 'Party not found'})
        }
        const request = await Request.findOne({_id: req.params.request_id, party: party._id})
        if (!request) {
            return res.status(404).send({error: 'Request not found'})
        }
        res.send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/me/parties/:id/requests_received/:request_id', auth, async(req, res) => {
    // Accept or reject a party request.
    const acceptedOptions = ['status', 'message']
    const receivedOptions = Object.keys(req.body)
    const isUpdateOption = receivedOptions.every((option) => acceptedOptions.includes(option))
    if (!isUpdateOption) {
        return res.status(400).send({error: 'Invalid update options'})
    }
    try {
        const party = await Party.findOne({_id: req.params.id, host: req.user._id})
        if (!party) {
            return res.status(404).send({error: 'Party not found'})
        }
        const request = await Request.findOne({_id: req.params.request_id, party: party._id})
        if (!request) {
            return res.status(404).send({error: 'Request not found'})
        }
        receivedOptions.forEach((option) => request[option] = req.body[option])
        await request.save()
        res.send(request)
    } catch (error) {
        res.status(500).send(error)
    }

})


module.exports = router