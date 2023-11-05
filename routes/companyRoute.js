const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const Company = require('../models/companyModel');
const CompanyTransaction = require('../models/companyTransactionModel');

//@GET Get all companies
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { user } = req.query;
    const companies = await Company.find({
      user: new ObjectId(user),
    });
    res.json(companies);
  })
);

//@GET Get company by id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    const company = await Company.findById(id);

    res.json(company);
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

//@DELETE Remove Multiple Company

router.put(
  '/delete',
  asyncHandler(async (req, res) => {
    const ids = req.body;

    const removedCompany = await Company.remove({
      _id: {
        $in: ids,
      },
    });

    if (_.isEmpty(removedCompany)) {
      return res
        .status(404)
        .json('Error removing Company Info.Try again later!!!');
    }

    await CompanyTransaction.remove({
      company: {
        $in: ids,
      },
    });

    return res.sendStatus(200);
  })
);

//@DELETE Remove Company by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    const removedCompany = await Company.findByIdAndDelete(id);

    if (_.isEmpty(removedCompany)) {
      return res
        .status(404)
        .json('Error removing Company Info.Try again later!!!');
    }

    await CompanyTransaction.findOneAndDelete({
      company: new ObjectId(id),
    });

    return res.sendStatus(200);
  })
);

module.exports = router;
