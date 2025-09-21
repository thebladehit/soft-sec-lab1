const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecretkey";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1].trim();

    if (!token) {
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded;
        }
        next();
    });
};

app.get('/', jwtAuthMiddleware, (req, res) => {
    if (req.user) {
        return res.json({
            username: req.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        return user.login === login && user.password === password;
    });

    if (user) {
        const token = jwt.sign(
            { username: user.username },
            JWT_SECRET,
            {expiresIn: '1d'}
        );
        console.log(token);

        res.json({ token: token, username: user.username });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
