const mongoose = require('mongoose')

const BirdSchema = new mongoose.Schema({
    comName: {
        type: String,
    },
    speciesCode: {
        type: String,
        unique: true
    },
    firstSpotted: {
        type: Date,
        default: Date.now
    },
})


const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    displayName: {
        type: String,
    },
    firstName: {
        type: String,
        // required: true,
    },
    lastName: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        // required: true,
    },
    image: {
        type: String,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bird: [BirdSchema]
})

module.exports = mongoose.model('User', UserSchema)
