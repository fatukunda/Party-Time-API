const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const userSchema = mongoose.Schema({
    firstName: {
        required: true,
        type: String,
        trim: true,
        validate: value => {
            if (!validator.isAlpha(value)) {
                throw new Error ({ error: 'First name should contain only letters' })
            }
        }
    },
    lastName: {
        required: true,
        type: String,
        trim: true,
        validate: value => {
            if (!validator.isAlpha(value)) {
                throw new Error ({ error: 'Last name should contain only letters' })
            }
        }
    },
    dob: {
        required: true,
        type: Date
    },
    gender: {
        required: true,
        type: String,
        enum: ['male', 'female', 'prefer not to say']
    },
    phoneNumber: {
        type: String,
        validate: value => {
            if (!validator.isMobilePhone(value)) {
                throw new error( { error: 'Invalid Phone number' } )
            }
        }
    },
    email: {
        required: true,
        type: String,
        lowercase: true,
        unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error ( { error: "Invalid email address" })
            }
        }
    },
    password: {
        required: true,
        type: String,
        minLength: 6,
        validate: value => {
            if(validator.contains(value, 'password')){
                    throw new Error({ error: 'Password cannot contain "password" ' })
            }
        }
    },
    bio: {
        type: String
    },
    avatar: {
        type: Buffer
    }, 
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    parties_attended: [{
        party: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    pending_parties: [{
        party: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    parties_denied: [{
        party: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    cancelled_parties: [{
        party: {
            type: mongoose.Schema.Types.ObjectId
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('parties_hosted', {
	ref: 'Party',
	localField: '_id',
	foreignField: 'host'
})

userSchema.pre('save', async function(next) {
    // Hash the user password before saving it to the database.
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for a user.
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    // Remove some sensitive properties from the user response data.
    const user = this
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar
    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}


const User = mongoose.model('User', userSchema)

module.exports = User