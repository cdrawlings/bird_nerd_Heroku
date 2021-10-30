const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const {flash} = require('../middleware/flash');

const User = require('../models/User');
const Location = require('../models/Location');
const Bird = require('../models/Bird');
const Watch = require('../models/WatchSession');


// @Desc    Login/Landing Page
// @route   GET/
router.get('/', ensureAuth, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    const birds = await User.aggregate([
        {$project: {_id: 1, bird: 1, comName: 1, speciesCode: 1, firstName: 1, lastName: 1}},
        {$match: {_id: idUser}},
        {$unwind: '$bird'},
        {$sort: {"bird.comName": 1}},
    ]);
    const location = await Location.findOne({user: req.user.id}).lean();
    res.render('birds/index', {
        birds,
        location
    })
});


// @Desc    type to get list of birds
// @route   GET/birds/add_birds
router.get('/add_birds', ensureAuth, flash, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    const birds = await User.aggregate([
        {$project: {_id: 1, bird: 1, comName: 1, speciesCode: 1, firstName: 1, lastName: 1}},
        {$match: {_id: idUser}},
        {$unwind: '$bird'},
        {$sort: {"bird.comName": 1}},
    ]);

    const location = await Location.findOne({user: req.user.id}).lean()
    console.log("Birds: ", birds)
    console.log("user: ", req.user.id)
    console.log("location: ", location)
    try {
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


// @desc    Process add form adding birds to spotted
// @route   POST /birds
router.post('/add_birds', ensureAuth, flash, async (req, res) => {
    const birds = await User.find({user: req.user.id}).lean();
    const location = await Location.findOne({user: req.user.id}).lean();
    try {
        await User.updateOne(
            {
                _id: req.user.id,
                bird: {
                    $not: {
                        $elemMatch: {
                            speciesCode: req.body.speciesCode
                        }
                    }
                }
            }, { $addToSet:
                    {
                    bird: {
                        comName: req.body.comName,
                        speciesCode: req.body.speciesCode
                    }
                }
            }
        )
        res.redirect('/dashboard')
    } catch (err) {
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


// @Desc    page to register birds during a watching session
// @route   GET/birds/session/:id
router.get('/session/:id', ensureAuth, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    let idWatch = mongoose.Types.ObjectId(req.params.id)
    try {
        const location = await Location.findOne({user: req.user.id}).lean();
        const session = await Watch.findById(req.params.id).lean()
        const birds = await User.aggregate([
            {$project: {_id: 1, bird: 1, comName: 1, speciesCode: 1, firstName: 1, lastName: 1}},
            {$match: {_id: idUser}},
            {$unwind: '$bird'},
            {$sort: {"bird.comName": 1}},
        ]);

        const seen = await Watch.aggregate([
            {$project: {comName: 1, speciesCode: 1, count: 1, _id: 1, user: 1}},
            {$match: {user: idUser}},
            {$unwind: '$count'},



            {$match: {_id: idWatch}},
            {$sort: {"count.comName": 1}},
        ]);

        // console.log("Seen: ", seen)
        // console.log("Birds: ", birds)

        let results = birds.filter(({bird: {speciesCode: id1}}) => !seen.some(({count: {speciesCode: id2}}) => id2 === id1));
        // console.log("Results: ", results)
        if (!session) {
            return res.render('errors/404')
        }

        if (session.user._id != req.user.id) {
            res.render('errors/404')
        } else {
            res.render('birds/session', {
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

    try {
        await User.updateOne(
            {
                _id: req.user.id,
                bird: {
                    $not: {
                        $elemMatch: {
                            speciesCode: req.body.speciesCode
                        }
                    }
                }
            },
            {
                $addToSet: {
                    bird: {
                        comName: req.body.comName,
                        speciesCode: req.body.speciesCode
                    }
                }
            })
        res.redirect('/birds/session/' + req.params.id)
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            req.session.message = {
                type: 'danger',
                intro: 'Duplicate',
                message: 'This bird has already been added to your list.'
            }
            res.render('/birds/add_birds',
                {birds})
        } else {
            console.error(err)
            res.render('errors/500')
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
    console.log("Update Top: ", req.body.count)
    console.log("ID top: ", req.params.id)
    console.log("Bird top: ", req.body.birdId)
    const update = await Watch.findOneAndUpdate(
        {"_id": req.params.id, "count.speciesCode": req.body.birdId},
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
    console.log("Create: ", req.body)
    const update = await Watch.findOneAndUpdate(
        {"_id": req.params.id},
        {
            $push: {
                count: {
                    count: req.body.count,
                    comName: req.body.birdName,
                    speciesCode: req.body.birdId
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
