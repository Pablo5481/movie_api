const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    
    

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const { check, validationResult } = require('express-validator');


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})

//logger
app.use(morgan('combined', {stream: accessLogStream}));
//public
app.use(express.static('public'));

const cors = require('cors');
app.use(cors());

//imported auth.js
let auth = require('./auth')(app);
//imported passport.js
const passport = require('passport');
require('./passport');

//CREATE 

/*
{
    ID: Integer,
    Username: String, 
    Password: String,
    Email: String,
    Birthday: Date
}*/
//allow new user to register

app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//DELETE

//delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
    .then ((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + 'was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

//allow users to delete from list of faves
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID } 
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error ' + err);
        } else {
            res.json(updatedUser);
          }
        });
    });

//UPDATE 

//update user info
app.put(
    '/users/:Username',
    [
      check('Username', 'Username is required').isLength({ min: 5 }),
      check(
        'Username',
        'Username contains non alphanumeric characters - not allowed.'
      ).isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail(),
      passport.authenticate('jwt', { session: false }),
    ],
    (req, res) => {
      // check validation object for errors
      let errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//add movie a users list of faves
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, //this line makes sure that the updated document is returned 
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
        });
    });


// READ 

//get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

//get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get homepage
app.get('/', (req,res) => {
    res.send('Welcome to my Futuristic Film Catalog!');
});

//get users list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//get specific movie title 
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('No Such Film');
        });
});
  
//get specific genre
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req)
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then((movie) => {
            res.status(201).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('No Such Genre!');
        });
});

//get specific director
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Director.Name': req.params.directorName })
        .then((movie) => {
            res.status(201).json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Director not in archives');
        });
});


//ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
