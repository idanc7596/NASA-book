const db = require('../models');
const Cookies = require('cookies');
const keys = ['keyboard cat'];
const SECOND = 1000;

//get registration page, and use the cookies to display in the form.
exports.getRegister = (req, res) => {
    const cookies = getCookies(req, res);
    res.render('register', {
        title: 'Nasa-book - register',
        error: false,
        detailsExist: cookies.detailsExist,
        details: {
            email: cookies.email,
            firstName: cookies.firstName,
            lastName: cookies.lastName
        },
    });
};

//save the user's name and email that inserted in the first registration form.
exports.postUserDetails = (req, res) => {
    //save the user details cookies:
    const cookies = new Cookies(req, res, {keys: keys});
    cookies.set('Email', req.body.email, {maxAge: 30 * SECOND});
    cookies.set('FirstName', req.body.firstName, {maxAge: 30 * SECOND});
    cookies.set('LastName', req.body.lastName, {maxAge: 30 * SECOND});

    // check if email already exist in db
    return db.User.findOne({where: {email: req.body.email}})
        .then((user) => {
            if (user === null) {
                res.redirect('./registerPassword');
            } else {
                res.clearCookie('Email', 'FirstName', 'LastName');
                res.render('register', {
                    title: 'Nasa-book - register',
                    error: true,
                    message: 'Email already exists, try again.',
                    detailsExist: false
                });
            }
        })
        .catch((err) => {
            res.render('register', {
                title: 'Nasa-book - register',
                error: true,
                message: err.message,
                detailsExist: false
            });
        });
};

//get the second registration page (of choosing password).
exports.getRegisterPassword = (req, res) => {
    const cookies = getCookies(req, res);
    if (!cookies.detailsExist) {
        res.redirect('./register');
    }
    res.render('registerPassword', {
        title: 'Nasa-book - choose password',
        wrongMatch: false
    });
};

//register the user's record in the database.
exports.postAddUser = (req, res) => {
    let {password, confirmPassword} = req.body;
    let {detailsExist, email, firstName, lastName} = getCookies(req, res);

    if (detailsExist) {
        email = email.toLowerCase().trim();
        firstName = firstName.toLowerCase().trim();
        lastName = lastName.toLowerCase().trim();
    }

    if (!detailsExist) { //cookies already deleted
        return res.render('register', {
            title: 'Nasa-book - register',
            error: true,
            message: 'Registration process has expired.',
            detailsExist: false
        });
    }
    if (password !== confirmPassword) {
        return res.render('registerPassword', {
            title: 'Nasa-book - choose password',
            wrongMatch: true,
            message: "Passwords don't match."
        });
    }

    //register the user in the database:
    return db.User.create({firstName, lastName, email, password})
        .then((/*user*/) => {
            res.clearCookie('Email', 'FirstName', 'LastName');
            res.render('login', {
                title: 'Nasa-book - login',
                userAdded: true,
                message: "Registration successful, you can now login.",
                error: false
            });
        })
        .catch((err) => {
            res.clearCookie('Email', 'FirstName', 'LastName');
            if (err.name === 'SequelizeUniqueConstraintError') {
                res.render('register', {
                    title: 'Nasa-book - register',
                    error: true,
                    message: 'Email already registered, try again.',
                    detailsExist: false
                });
            }
            else {
                res.render('register', {
                    title: 'Nasa-book - register',
                    error: true,
                    message: err.message,
                    detailsExist: false
                });
            }
        });
}

function getCookies(req, res) {
    const cookies = new Cookies(req, res, {keys: keys});
    const email = cookies.get('Email');
    const firstName = cookies.get('FirstName');
    const lastName = cookies.get('LastName');
    const detailsExist = email && firstName && lastName;
    return {
        detailsExist: detailsExist,
        email: email,
        firstName: firstName,
        lastName: lastName
    }
}

