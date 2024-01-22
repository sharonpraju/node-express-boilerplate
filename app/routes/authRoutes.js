const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const accessControl = require('../utils/access-control').accessControl;

const setAccessControl = (access_type) => {
    return (req, res, next) => {
        accessControl(access_type, req, res, next)
    }
};

router.post('/login', setAccessControl('*'), authController.login);
router.post('/logout', setAccessControl('1,2,3'), authController.logout);
module.exports = router;