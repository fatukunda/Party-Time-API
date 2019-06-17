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
}, {
    timestamps: true
})

partySchema.virtual('party_requests', {
    ref: 'Request',
    localField: '_id',
    foreignField: 'party'
})

partySchema.methods.toJSON = function() {
    // Remove some properties from the party response data.
    const party = this
    const partyObject = party.toObject()
    delete partyObject.photos
    return partyObject
}

const Party = mongoose.model('Party', partySchema)

module.exports = Party