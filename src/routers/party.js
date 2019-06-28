const express = require('express');
const Party = require('../models/Party');
const auth = require('../middleware/auth');
const User = require('../models/User');
const sharp = require('sharp');
const { imageUpload } = require('../utils/imageupload');

const router = express.Router();

router.post('/me/hosted_parties', auth, async (req, res) => {
	// Create a party to host.
	const party = new Party({
		...req.body,
		host: req.user._id,
	});
	try {
		await party.save();
		res.status(201).send(party);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/me/hosted_parties', auth, async (req, res) => {
	//Get a list of parties I've/I'm hosting
	await req.user
		.populate({
			path: 'parties_hosted',
		})
		.execPopulate();
	res.send(req.user.parties_hosted);
});

router.get('/me/hosted_parties/:id', auth, async (req, res) => {
	// Get a single party hosted by a logged in user.
	const party = await Party.findOne({ _id: req.params.id, host: req.user._id });
	if (!party) {
		return res.status(404).send({ error: 'Party not found' });
	}
	res.send(party);
});

router.patch('/me/hosted_parties/:id', auth, async (req, res) => {
	// Edit party details of a logged in user
	const allowedEditOptions = ['title', 'description', 'address', 'category'];
	const receivedOptions = Object.keys(req.body);
	const isUpdateOption = receivedOptions.every(option => allowedEditOptions.includes(option));
	if (!isUpdateOption) {
		res.status(400).send({ error: 'Invalid update option' });
	}
	try {
		const party = await Party.findOne({ _id: req.params.id, host: req.user._id });
		if (!party) {
			return res.status(404).send({ error: 'Party not found' });
		}
		receivedOptions.forEach(option => (party[option] = req.body[option]));
		party.save();
		res.send(party);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete('/me/hosted_parties/:id', auth, async (req, res) => {
	// Delete a party from a list of hosted parties.
	try {
		const party = await Party.findOne({ _id: req.params.id, host: req.user._id });
		if (!party) {
			return res.status(404).send({ error: 'Party not found' });
		}
		await party.remove();
		res.send(party);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post('/me/hosted_parties/:id/images', auth, imageUpload.array('images', 6), async (req, res) => {
	// Upload images to a party you're hosting
	try {
		const party = await Party.findOne({ _id: req.params.id });
		if (!party) {
			return res.status(404).send({ error: 'The party was not found' });
		}
		const photos = req.files;
		if (!photos) {
			return res.status(400).send({ error: 'Please upload some images' });
		}
		photos.map(async photo => {
			const buffer = await sharp(photo.buffer)
				.resize({ width: 600, height: 600 })
				.png()
				.toBuffer();
			party.photos.push({ photo: buffer });
			party.save();
		});
		res.send({ message: 'Images successfully uploaded' });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete('/me/hosted_parties/:id/images/:imageId', auth, async (req, res, next) => {
	// Remove a party picture.
	try {
		const party = await Party.findOne({ _id: req.params.id, host: req.user._id });
		if (!party) {
			return res.status(404).send({ error: 'Party not found' });
		}
		party.photos.map((photo, index) => {
			if (photo._id == req.params.imageId) {
				party.photos.splice(index, 1);
				party.save();
				res.send(party);
			} else {
				res.status(404).send({ error: 'Photo not found' });
			}
		});
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/users/:user_id/hosted_parties/:id/images', async (req, res) => {
	// Get a party profile picture
	try {
		const user = await User.findById({ _id: req.params.user_id });
		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}
		const party = await Party.findOne({ _id: req.params.id, host: user._id });
		if (!party || party.photos === []) {
			return res.status(404).send({ error: 'No party images found' });
		}
		res.set('Content-Type', 'image/jpg');
		res.send(party.photos[0].photo);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/users/:id/hosted_parties', auth, async (req, res) => {
	// Get a list of parties hosted by a given user.
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}
		await user
			.populate({
				path: 'parties_hosted',
			})
			.execPopulate();
		res.send(user.parties_hosted);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/users/:id/hosted_parties/:party_id', auth, async (req, res) => {
	//Get a single party hosted by a given user
	const user_id = req.params.id;
	const party_id = req.params.party_id;
	try {
		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}
		const party = await Party.findOne({ _id: party_id, host: user_id });
		if (!party) {
			return res.status(404).send({ error: 'Party not found' });
		}
		res.send(party);
	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;
