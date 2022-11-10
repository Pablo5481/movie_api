
const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    
    

const app = express();

let users = [
    {
        name: 'Sifat Harun',
        id: 1,
        favoriteMovies: []
    },
    {
        name: 'Pablo Coronel',
        id: 2,
        favoriteMovies: []
    }
];

let movies = [
    {
        title: 'Gravity',
        director: 'Alfonso Cuaron',
        year: 2013,
        genre: 'Thriller',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Contact',
        director: 'Robert Zemeckis',
        year: 2002,
        genre: 'Sci-fi',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Minority Report',
        director: 'Steven Spielbergs',
        year: 1997,
        genre: 'Action',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'no'
    },
    {
        title: '2001: A Space Odyssey',
        director: 'Stanley Kubrick',
        year: 1968,
        genre: 'Sci-fi',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'no'
    },
    {
        title: 'Escape From New York',
        director: 'John Carpenter',
        year: 1991,
        genre: 'Action',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Dune',
        director: 'Denis Villenueve',
        year: 2021,
        genre: 'Sci-fi',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'no'
    },
    {
        title: 'Close Encounters of the Third Kind',
        director: 'Steven Speilberg',
        year: 1977,
        genre: 'Thriller',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Alien',
        director: 'Ridley Scott',
        year: 1979,
        genre: 'Thriller',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Scanners',
        director: 'David Cronenberg',
        year: 1981,
        genre: 'Action',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Blade Runner',
        director: 'Ridley Scott',
        year: 1997,
        genre: 'Sci-fi',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'yes'
    },
    {
        title: 'Back to the Future',
        director: 'Robert Zemeckis',
        year: 1985,
        genre: 'Action',
        description: 'This film is about a woman and man in space who work together to make it back to Earth safely after a disaster.',
        imageURL: 'url to image',
        featured: 'no'
    }
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})

//logger
app.use(morgan('combined', {stream: accessLogStream}));
//public
app.use(express.static('public'));

app.use(bodyParser.json());

//CREATE 
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
       newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('user needs name')
    }
});

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; 

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(user);
    } else {
        res.status(400).send('no such movie')
    }
});

//DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; 

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params; 

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send('user has been deleted');
    } else {
        res.status(400).send('no such user')
    }
});

//UPDATE 
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(201).send(user)
    } else {
        res.status(400).send('no such user')
    }
});


// READ 
app.get('/', (req,res) => {
    res.send('Welcome to my Futuristic Film Catalog!');
});

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/users', (req, res) => {
    res.status(200).json(users);
});

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const topMovies = movies.find( movie => movie.title === title );

    if (topMovies) {
        res.status(200).json(topMovies);
    } else {
        res.status(400).send('no such movie')
    }
});
    
app.get('/movies/genre/:genre', (req, res) => {
    const { genre } = req.params;
    const genreName = movies.find( movie => movie.genre === genre ).genre;

    if (genreName) {
        res.status(200).json(genreName);
    } else {
        res.status(400).send('no such genre')
    }
});

app.get('/movies/director/:director', (req, res) => {
    const { director } = req.params;
    const directorName = movies.find( movie => movie.director === director ).director;

    if (directorName) {
        res.status(200).json(directorName);
    } else {
        res.status(400).send('no such director')
    }
});

/*

*/


/*







//user removed




*/

//ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});

