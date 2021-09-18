const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const {ensureAuth, ensureGuest} = require('../middleware/auth')

const Location = require('../models/Location');
const Watch = require('../models/WatchSession');
const Bird = require('../models/Bird');
const User = require('../models/User');

// @Desc    Login/Landing Page
// @route   GET/
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: "login"
    })
});

// @Desc    Login/Landing Page
// @route   GET/ login
router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        layout: "login"
    })
});

// @desc    Authenticate login
// @route   POST / Login
router.post('/login', ensureGuest, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// @desc    Gets the users location
// @route   POST / location
router.get('/register', ensureGuest, async (req, res) => {
    res.render('register', {
        layout: "login"
    })
});

// @desc    REGISTERS THE USER
// @route   Get / Registers
router.post('/register', ensureGuest, async (req, res) => {
    let {firstName, lastName, email, password, password2} = req.body;

    let errors = [];

    if (!firstName || !lastName || !email || !password || !password2) {
        errors.push({msg: 'Please enter all fields'});
    }

    if (password != password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    if (password.length <= 5) {
        errors.push({msg: 'Password must be at least 6 characters'});
    }
    if (errors.length > 0) {
        res.render('register', {
            layout: "login",
            errors,
            firstName,
            lastName,
            email,
        });
    } else {
        User.findOne({email: email})
            .then(user => {
                if (user) {
                    errors.push({msg: 'Email is already registered'});
                    res.render('register', {
                        errors,
                        firstName,
                        lastName,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        firstName,
                        lastName,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now regisitered');
                                    res.redirect('/');
                                })
                                .catch(err => console.log(err));
                        }))
                }
            });
    }
});


// @Desc    Dashboard
// @route   GET/ Dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    let idWatch = mongoose.Types.ObjectId(req.params.id)
    try {
        const location = await Location.findOne({user: req.user.id}).lean();
        const session = await Watch.findById(req.params.id).lean()
        const birds = await Bird.find({user: req.user.id}).lean()

        const last = await Watch.aggregate([
            {$match: {user: idUser}},
            {$project: {_id: 1, user: 1, comName: 1, 'count': 1, 'startTime': 1}},
            {$sort: {startTime: -1}},
            {$limit: 1},
            {$unwind: '$count'}, // All records for this user
            {
                $lookup: {
                    from: "birds",
                    localField: "count.bird",
                    foreignField: "_id",
                    as: "bird"
                }
            },
            {$unwind: '$bird'},// All records including the seesion data for each entry
        ]);

        res.render('dashboard', {
            layout: "dash",
            name: req.user.firstName,
            location,
            birds,
            session,
            last
        });
    } catch (err) {
        console.error(err);
        res.render('errors/500');
    }
});

// @desc    Gets the users location
// @route   POST / location
router.post('/add_location', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Location.create(req.body)
        res.redirect('dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
});


// @Desc    Get chart information
// @route   GET/ chart
router.get('/chart', ensureAuth, async (req, res) => {
    let idUser = mongoose.Types.ObjectId(req.user.id)
    // let idWatch = mongoose.Types.ObjectId(req.params.id)
    try {
        const location = await Location.findOne({user: req.user.id}).lean();

        const birds = await Bird.aggregate([
            {$match: {user: idUser}},
            {$project: {_id: 1, user: 1, comName: 1, 'count': 1, 'startTime': 1}},
            {$unwind: '$count'},
            {
                $lookup: {
                    from: "watchsessions",
                    localField: "count.watchSession",
                    foreignField: "_id",
                    as: "watch"
                }
            },
            {$unwind: '$watch'},


        ]);
        console.log(birds)

        res.render('chart', {
            name: req.user.firstName,
            location,
            birds,
        });


    } catch (err) {
        console.error(err);
        res.render('errors/500');
    }
});

// @desc    Gets the users location
// @route   POST / Session start
router.post('/start', ensureAuth, async (req, res) => {
    try {
        let session = new Watch();
        session.user = req.user.id;
        session.tempature = req.body.tempature;
        session.condition = req.body.condition;
        session.local = req.body.local;
        session.save(function (err, start) {
            if (err) {
                console.log(err);
            } else {
                console.log("Session starteed: ")
            }
        });
        res.redirect('birds/session/' + session.id)
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
});

module.exports = router