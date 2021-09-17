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
    lastSpotted: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Bird', BirdSchema)
