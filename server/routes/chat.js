const express = require('express');
const { Auth } = require('../middleware/auth');
const router = express.Router();
const { accessChats, fetchAllChats, createGroup, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatContollers');


router.post('/', Auth, accessChats);
router.get('/', Auth, fetchAllChats);
router.post('/group', Auth, createGroup);
router.patch('/group/rename', Auth, renameGroup);
router.patch('/groupAdd', Auth, addToGroup);
router.patch('/groupRemove', Auth, removeFromGroup);
router.delete('/removeuser', Auth);


export default router;