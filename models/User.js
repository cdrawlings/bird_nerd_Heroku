const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const BirdSchema = new mongoose.Schema({
    comName: {
        type: String,
    },
    speciesCode: {
        type: String,
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

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema)
