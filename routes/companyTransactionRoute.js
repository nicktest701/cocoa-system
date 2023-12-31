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
    const { company, session } = req.query;

    const companyTransaction = await CompanyTransaction.find({
      company: ObjectId(company),
      session,
    }).sort({ date: 1 });

    res.json(companyTransaction);
  })
);

//@GET Get  companyTransaction by transactionId
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const companyTransaction = await CompanyTransaction.findById(id);

    if (_.isEmpty(companyTransaction)) {
      return res
        .status(404)
        .json('Error fetching company Transaction.Try again later');
    }

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
    const id = req.body._id;
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

//@DELETE Remove Multiple Company

router.put(
  '/delete',
  asyncHandler(async (req, res) => {
    const ids = req.body;

    const removedCompany = await CompanyTransaction.remove({
      _id: {
        $in: ids,
      },
    });

    if (_.isEmpty(removedCompany)) {
      return res
        .status(404)
        .json('Error removing transactions.Try again later!!!');
    }

    return res.sendStatus(200);
  })
);

//@DELETE Remove CompanyTransaction by id

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const removedCompanyTransaction =
      await CompanyTransaction.findByIdAndDelete(id);

    res.sendStatus(200);
  })
);

module.exports = router;
