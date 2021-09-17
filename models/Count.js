const mongoose = require('mongoose')

const CountSchema = new mongoose.Schema({
    count: {
        type: String,
    },
    bird: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bird'
    },
    watch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WatchSession'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
})

module.exports = mongoose.model('Count', CountSchema)
