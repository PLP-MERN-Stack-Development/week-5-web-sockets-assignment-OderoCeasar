const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageControllers');
const { Auth }  = require('../middleware/auth');


router.post('/', Auth, sendMessage);
router.get('/:chatId', Auth, getMessages);


module.exports = router;