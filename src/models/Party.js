const mongoose = require('mongoose')

const partySchema = mongoose.Schema({
    title: {
        required: true,
        type: String,
        trim: true
    },
    description: {
        required: true,
        type: String,
        trim: true
    },
    address: {
        required: true,
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['house party', 'birthday party', 'movie night', 'other']
    },
    photos: [{
        photo: {
            type: Buffer
        }
    }],
    host: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guests: [{
        guest: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    guest_requests: [{
        request: {
            type: mongoose.Schema.Types.ObjectId
        }
    }]

}, {
    timestamps: true
})

const Party = mongoose.model('Party', partySchema)

module.exports = Party