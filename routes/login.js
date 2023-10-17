const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');

router.get('/', loginController.getLogin);
router.post('/login', loginController.postLogin);
router.get('/login', (req,res) => {
    res.redirect('/');
});

module.exports = router;









