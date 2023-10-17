let express = require('express');
const apiController = require("../controllers/api");
let router = express.Router();


router.post('/comments', apiController.postComment);
router.get('/comments/:imageDate', apiController.getComments);
router.delete('/comments', apiController.deleteComment);

module.exports = router;