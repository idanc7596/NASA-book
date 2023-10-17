let express = require('express');
const userSessionController = require("../controllers/userSession");
let router = express.Router();

router.get('/loggedInUser', userSessionController.getLoggedInUser);
router.post('/logout', userSessionController.logout);

module.exports = router;