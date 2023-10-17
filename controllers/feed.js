//get the feed of the pictures.
exports.getFeed = (req, res) => {
    res.render('feed', {
        title: 'Nasa-book',
    });
};