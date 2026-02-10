const express = require('express');
const router = express.Router();
const controller = require('./document.controller');

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
