var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    fs          = require('fs');

// read environment variables

var envFile = './environment.json';

var env;

try {
    env = JSON.parse(fs.readFileSync(envFile));
}
catch (err) {
    console.log(err.stack);
    env = {};
}

// db

mongoose.connect(env.MONGO_URI);

// app

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// models

var Item = require('./app/models/item');

// routes

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
    res.json({ message: 'Nourish API' });   
});

router.route('/items')

    // create a menu item
    .post(function(req, res) {
        
        var item = new Item();      // create a new instance of the Item model
        item.name = req.body.name;  // set the item's name (comes from the request)

        // save the item and check for errors
        item.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Item created!' });
        });
        
    });


// register routes
app.use('/api', router);

// start server
app.listen(port);
console.log('Magic on port ' + port);