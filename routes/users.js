const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');

router.get('/register', usersController.getRegister);
router.get('/registerPassword', usersController.getRegisterPassword);
router.post('/saveCookie', usersController.postUserDetails);
router.get('/saveCookie', (req,res) => {
    res.redirect('./register');
});
router.post('/addUser', usersController.postAddUser);
router.get('/addUser', (req,res) => {
    res.redirect('/');
});

module.exports = router;









