const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
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
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const companyTransaction = await CompanyTransaction.find({
      company: ObjectId(id),
    }).sort({ createdAt: 1 });

    res.json(companyTransaction);
  })
);

//@GET Get all  companyTransaction by transactionId
router.get(
  '/transaction/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const companyTransaction = await CompanyTransaction.findById(id);

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

    if (!isValidObjectId(id)) {
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
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
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
