
//if already logged in and trying to access register/login page - redirect to feed.
exports.loggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/feed');
    }
    next();
}

//prevent user from getting access to feed if he is not logged-in.
exports.notLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
}
exports.disconnected = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).send();
    }
    next();
}