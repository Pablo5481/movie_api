const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();


const topMovies = [
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
        year: 2002
    },
    {
        title: 'Minority Report',
        director: 'Steven Spielbergs',
        year: 1997
    },
    {
        title: '2001: A Space Odyssey',
        director: 'Stanley Kubrick',
        year: 1968
    },
    {
        title: 'Escape From New York',
        director: 'John Carpenter',
        year: 1991
    },
    {
        title: 'Dune',
        director: 'Denis Villenueve',
        year: 2021
    },
    {
        title: 'Close Encounters of the Third Kind',
        director: 'Steven Speilberg',
        year: 1977
    },
    {
        title: 'Alien',
        director: 'Ridley Scott',
        year: 1979
    },
    {
        title: 'Scanners',
        director: 'David Cronenberg',
        year: 1981
    },
    {
        title: 'Blade Runner',
        director: 'Ridley Scott',
        year: 1997
    },
    {
        title: 'Back to the Future',
        director: 'Robert Zemeckis',
        year: 1985
    }
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})

//logger
app.use(morgan('combined', {stream: accessLogStream}));
//public
app.use(express.static('public'));


app.get('/', (req,res) => {
    res.send('Welcome to my Futuristic Film Catalog!');
});

app.get('/movies', (req, res) => {
    res.send(topMovies);
});

/*






*/

//ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});

