const router = require('express').Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const CompanyTransaction = require('../models/companyTransactionModel');

//@GET Get all company transaction
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;

    const companyTransaction = await CompanyTransaction.find({
      transactionId,
    }).sort({ createdAt: 1 });
    if (_.isEmpty(companyTransaction)) {
      return res
        .status(404)
        .json('Error fetching company Transactions.Try again later');
    }
    res.json(companyTransaction);
  })
);
//@GET Get  companyTransaction by transactionId
router.get(
  '/:transactionId',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const companyTransaction = await CompanyTransaction.findOne({
      transactionId,
    });

    res.json(companyTransaction);
  })
);

//@GET Get all  companyTransaction by transactionId
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const companyTransaction = await CompanyTransaction.findOne({
      transactionId,
    });

    res.json(companyTransaction);
  })
);

//@POST Add new CompanyTransaction
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newCompanyTransaction = req.body;

    const createdCompanyTransaction = await CompanyTransaction.create(
      newCompanyTransaction
    );

    if (_.isEmpty(createdCompanyTransaction)) {
      return res
        .status(404)
        .json('Error saving CompanyTransaction Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@PUT update companyTransaction info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedCompanyTransaction = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json('invalid company Transaction id');
    }

    const updatedCompanyTransaction =
      await CompanyTransaction.findByIdAndUpdate(
        id,
        modifiedCompanyTransaction,
        {
          upsert: true,
          new: true,
        }
      );

    if (_.isEmpty(updatedCompanyTransaction)) {
      return res
        .status(404)
        .json('Error saving CompanyTransaction Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove CompanyTransaction by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    if (typeof id === 'string') {
      const removedCompanyTransaction =
        await CompanyTransaction.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === 'object') {
      id.map(async ({ _id }) => {
        await CompanyTransaction.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
