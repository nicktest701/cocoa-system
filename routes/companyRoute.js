const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const Company = require('../models/companyModel');

//@GET Get all companies
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const companies = await Company.find({});
    res.json(companies);
  })
);

//@GET Get all  company by transactionId
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const company = await Company.findOne({
      transactionId,
    });

    res.json(company);
  })
);
//@GET Get  company by transactionId
router.get(
  '/:user',
  asyncHandler(async (req, res) => {
    const id = req.params.user;
    const company = await Company.find({
      user: ObjectId(id),
    });
    res.status(200).json(company);
  })
);

//@POST Add new Company
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newCompany = req.body;

    const createdCompany = await Company.create(newCompany);

    if (_.isEmpty(createdCompany)) {
      return res
        .status(404)
        .json('Error saving Company Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@PUT update company info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedCompany = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json('invalid company id');
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      modifiedCompany,
      {
        upsert: true,
        new: true,
      }
    );

    if (_.isEmpty(updatedCompany)) {
      return res
        .status(404)
        .json('Error saving Company Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove Company by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    if (typeof id === 'string') {
      const removedCompany = await Company.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === 'object') {
      id.map(async ({ _id }) => {
        await Company.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
