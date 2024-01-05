const express = require('express');
const adminController = require('../controllers/adminController');
const adminRouter = express.Router();

adminRouter.post('/pending', adminController.handlePending);
adminRouter.patch('/products/:id/approve', adminController.approveProduct);
adminRouter.patch('/products/:id/reject', adminController.rejectProduct);

module.exports = adminRouter;
