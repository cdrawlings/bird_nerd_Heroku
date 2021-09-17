const mongoose = require('mongoose')

const CountSchema = new mongoose.Schema({
    count: {
        type: Number,
    },
    bird: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bird'
    }
})

const WatchSessionSchema = new mongoose.Schema({
    tempature: {
        type: String
    },
    condition: {
        type: String
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    local: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    count: [CountSchema]
});

module.exports = mongoose.model('WatchSession', WatchSessionSchema)
