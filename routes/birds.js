const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const {flash} = require('../middleware/flash');

const Location = require('../models/Location');
const Bird = require('../models/Bird');
const Watch = require('../models/WatchSession');


// @Desc    Login/Landing Page
// @route   GET/
router.get('/', ensureAuth, async (req, res) => {
    const birds = await Bird.find({user: req.user.id}).lean()
    const location = await Location.findOne({user: req.user.id}).lean();
    res.render('birds/index', {
        birds,
        location
    })
});

// @Desc    type to get list of birds
// @route   GET/birds/add_birds
router.get('/add_birds', ensureAuth, flash, async (req, res) => {
    try {
        const birds = await Bird.find({user: req.user.id}).lean()
        const location = await Location.findOne({user: req.user.id}).lean()
        res.render('birds/add_birds', {
            name: req.user.firstName,
            location,
            birds
        });
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
});


// @Desc    page to register birds during a watching session
// @route   GET/birds/session/:id
router.get('/session/:id', ensureAuth, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    let idWatch = mongoose.Types.ObjectId(req.params.id)
    try {
        const location = await Location.findOne({user: req.user.id}).lean();
        const session = await Watch.findById(req.params.id).lean()
        const birds = await Bird.find({user: req.user.id}).lean()

        const seen = await Watch.aggregate([
            {$project: {comName: 1, speciesCode: 1, count: 1, _id: 1, user: 1}},
            {$match: {user: idUser}},
            {$unwind: '$count'},
            {
                $lookup: {
                    from: "birds",
                    localField: "count.bird",
                    foreignField: "_id",
                    as: "birds"
                }
            },
            {$unwind: '$birds'},
            {$match: {_id: idWatch}},
        ]);

        let results = birds.filter(({speciesCode: id1}) => !seen.some(({birds: {speciesCode: id2}}) => id2 === id1));

        if (!session) {
            return res.render('errors/404')
        }

        if (session.user._id != req.user.id) {
            res.render('errors/404')
        } else {
            res.render('birds/session', {
                layout: "main",
                session,
                birds,
                seen,
                location,
                results
            })
        }
    } catch (err) {
        console.error(err)
        res.render('errors/404')
    }
})


// @desc    Process add form adding birds to spotted
// @route   POST /birds
router.post('/add_birds', ensureAuth, flash, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Bird.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            req.flash('error', 'You have already spotted that bird')
            res.render('birds/add_birds',
                {
                    messages: req.flash('error'),
                    name: req.user.firstName,
                    birds
                });

        } else {
            console.error(err)
            res.render('errors/500');
        }
    }
});


// @desc    add birds to the spotte list from with in the watch sesssion
// @route   POST /birds
router.get('/add_bird_session/:id', ensureAuth, flash, async (req, res) => {
    try {
        const location = await Location.findOne({user: req.user.id}).lean();
        res.render('birds/add_bird_session', {
            name: req.user.firstName,
            location,
            sessionId: req.params.id
        });
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
});


// @desc    Process add form adding birds to spotted
// @route   POST /birds/add_bird_session
router.post('/add_bird_session/:id', ensureAuth, flash, async (req, res) => {
    const newBird = {
        comName: req.body.comName,
        speciesCode: req.body.speciesCode,
        user: req.user.id,
        count: {
            count: req.body.count,
            watchSession: req.params.id
        }
    }
    try {
        let bird = await Bird.findOne({id: req.body.id})
        if (bird) {
            done(null, bird)
        } else {
            bird = await Bird.create(newBird)
            done(null, bird)
        }
    }
    ccatch(err)
    {
        if (err.name === 'MongoError' && err.code === 11000) {
            req.flash('error', 'You have already spotted that bird')
            res.render('birds/add_birds',
                {
                    messages: req.flash('error'),
                    name: req.user.firstName,
                    location,
                    birds
                });
        } else {
            console.error(err)
            res.render('errors/500');
        }
    }
});


// @desc    show information for a single bird
// @route   put /birds
router.put('/single/:id', ensureAuth, async (req, res) => {
    const birds = await Bird.aggregate([
        {
            $project: {
                comName: 1,
                speciesCode: 1,
                count: 1,
                _id: 1,
                user: 1,
                'count.count': 1,
                'count.watchSession.startTime': 1
            }
        },
        {$match: {user: idUser}},
        {$match: {'count.watchSession': idWatch}}
    ]);
});


// @desc    updates session with the new number of birds spotted
// @route   put /birds
router.put('/update/:id', ensureAuth, async (req, res) => {
    const update = await Watch.findOneAndUpdate(
        {"_id": req.params.id, "count.bird": req.body.birdId},
        {
            $set: {"count.$.count": req.body.count}
        }, {
            new: true,
            upsert: true,
            rawResult: true
        });
    res.redirect('/birds/session/' + req.params.id)
});


// @desc    Creates new spotted bird watch seesion
// @route   put /birds/create
router.put('/create/:id', ensureAuth, async (req, res) => {
    const update = await Watch.findOneAndUpdate(
        {"_id": req.params.id},
        {
            $push: {
                count: {
                    count: req.body.count,
                    bird: req.body.birdId
                }
            }
        }, {
            new: true,
            upsert: true,
            rawResult: true
        }
    );

    res.redirect('/birds/session/' + req.params.id)
});

module.exports = router