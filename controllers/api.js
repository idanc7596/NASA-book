const db = require('../models');

// post a comment and update the database:
exports.postComment = (req, res) => {
    const {imageDate, userID, username, text} = req.body;
    if(!imageDate || !userID || !username || !text) {
        return res.status(400).send("Some parameters are missing");
    }
    return db.Comment.create({imageDate, userID, username, text})
        .then((comment) => res.json(comment))
        .catch((err) => {
            return res.status(400).send(err.message);
        })
};

//get the updated comments of given picture.
exports.getComments = (req, res) => {
    if(!req.params.imageDate.match(/^\d{4}-\d{2}-\d{2}$/i)) {
        return res.status(400).send('Date is not in valid format.');
    }
    return db.Comment.findAll({where: {imageDate: req.params.imageDate}})
        .then((comments) => res.send(comments))
        .catch((err) => {
            return res.status(400).send(err.message);
        });
}

//delete the comment that was sent in the request body by the client.
exports.deleteComment = (req, res) => {
    const commentID = req.body.commentID;
    if(!commentID) {
        return res.status(400).send("Comment ID is missing.");
    }
    if(isNaN(commentID)) {
        return res.status(400).send("Comment ID must be a number.");
    }
    return db.Comment.findByPk(commentID)
        .then((comment) => comment.destroy({ force: true }))
        .then(() => res.json({commentID: commentID}))
        .catch((err) => {
            return res.status(400).send(err.message);
        });
};