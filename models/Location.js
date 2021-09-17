const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    location: {
        type: String,
    },
    city: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
})

module.exports = mongoose.model('Location', LocationSchema)
