const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController.js');
const accessControl = require('../utils/access-control.js').accessControl;
const { parseMultipartForm } = require('../utils/middlewares/upload-middleware');

const setAccessControl = (access_type) => {
    return (req, res, next) => {
        accessControl(access_type, req, res, next)
    }
};

router.get('/users', setAccessControl('1'), usersController.fetchUsers);
router.post('/users', setAccessControl('1'), usersController.addUser);
router.get('/users/profile', setAccessControl('1,2,3'), usersController.fetchProfile);
router.get('/users/types', setAccessControl('1'), usersController.fetchTypes);
router.post('/users/types', setAccessControl('1'), parseMultipartForm, usersController.addType);
router.get('/users/types/:id', setAccessControl('1'), usersController.fetchType);
router.put('/users/types/:id', setAccessControl('1'), parseMultipartForm, usersController.updateType);
router.delete('/users/types/:id', setAccessControl('1'), usersController.deleteType);
router.get('/users/:id', setAccessControl('1,2,3'), usersController.fetchUser);
router.put('/users/:id', setAccessControl('1'), usersController.updateUser);
router.delete('/users/:id', setAccessControl('1'), usersController.deleteUser);

module.exports = router;