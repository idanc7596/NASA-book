const db = require('../models');
const Cookies = require("cookies");
const keys = ['keyboard cat'];

//get login page.
exports.getLogin = (req, res) => {
    const cookies = new Cookies(req, res, {keys: keys});
    const sessionExpired = cookies.get('sessionExpired');
    res.clearCookie('sessionExpired');
    res.render('login', {
        title: 'Nasa-book - login',
        userAdded: false,
        error: sessionExpired,
        message: "Session expired, please log in again."
    });
};

//handle post request (try to log in).
exports.postLogin = (req, res) => {
    const {email, password} = req.body;
    return db.User.findOne({ where: { email: email }})
        .then((user) => {
            if(user === null) { //user doesn't exist in the database
                res.render('login', {
                    title: 'Nasa-book - login',
                    userAdded: false,
                    error: true,
                    message: 'Email does not exist.'
                });
            }
            else {
                user.validPassword(password)
                    .then(correctPassword => {
                        if(correctPassword) { //password is correct
                            req.session.isLoggedIn = true;
                            req.session.userID = user.id;
                            req.session.username = user.firstName + " " + user.lastName;
                            res.redirect('/feed');
                        }
                        else {
                            res.render('login', {
                                title: 'Nasa-book - login',
                                userAdded: false,
                                error: true,
                                message: 'Incorrect password.'
                            });
                        }
                    })
            }
        })
        .catch((err) => {
            res.render('login', {
                title: 'Nasa-book - login',
                userAdded: false,
                error: true,
                message: err.message
            });
        });
};