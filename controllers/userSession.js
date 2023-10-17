//get the user session information.
exports.getLoggedInUser = (req, res) => {
    const loggedInUser = {
        isLoggedIn: req.session.isLoggedIn,
        userID: req.session.userID,
        username: req.session.username
    }
    res.json(loggedInUser);
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};