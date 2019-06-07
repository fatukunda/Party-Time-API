const mongoose = require('mongoose')

const requestSchema = mongoose.Schema({
    requestor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Party'
    },
    message: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
})

const Request = mongoose.model('Request', requestSchema)

module.exports = Request