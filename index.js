const express = require('express');
const port = 8000;
const app = express();
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session')
const methodOverride = require('method-override')
const users =[]

const initialize = require('./config/passportLocal')

initialize(passport, 
    email => users.find(user => user.email == email),
    id => users.find(user => user.id == id));

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}))

app.use(session({
    secret: 'secret',
    resave: false,
saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})
app.get('/login', checkNotAuthenticated, (req, res)=> {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    try {
        const hashpassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashpassword
        })
        res.redirect('/login')
    } catch (error) {
        console.log(error);
        res.redirect('/register');
    }
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }))


app.delete('/logout', (req, res)=> {
    req.logOut(function(err){
        if(err){
            console.log(err);
            return res.redirect('/')
        }
        return res.redirect('/login')
    })
} )
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated())
    {
        return next()
    }
    return res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated())
    {
        return res.redirect('/')
    }
    return next()
}

app.listen(port, function(err){
    if(err){
        console.log(`Error in running the server: ${err}`)
        return;
    }
    console.log(`Server is up and running on port: ${port}`);
})