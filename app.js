const path = require('path');
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db');
const dayjs = require('dayjs')


// Load config
dotenv.config({path: './config/config.env'});

require('./config/passport')(passport);


connectDB();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan())
}

const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json(
    {
        type: ['application/json', 'text/plain']
    }, {limit: '1mb'}
));


// Method override
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
);

// Handlebars Helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs');

// Handlebars
app.engine('.hbs',
    exphbs({
        helpers: {
            formatDate,
            stripTags,
            truncate,
            editIcon,
            select
        },
        defaultLayout: 'main',
        extname: '.hbs',
    })
);
app.set('view engine', '.hbs');

app.use(cookieParser());

// Sessions
app.use(session({
    secret: 'oodlesofbluenoodles',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie:
        {
            secure: false,
            maxAge: 360000
        }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

// Flash Glabal variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.errors_msg = req.flash('errors_msg');
    next();
});

app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
})

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/birds', require('./routes/birds'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));