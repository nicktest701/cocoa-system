const router = require("express").Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");

//@GET Get all companies
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const companies = await Company.find({});
    if (!_.isArray(companies)) {
      return res.status(404).json("Error fetching companies.Try again later");
    }
    res.json(companies);
  })
);
//@GET Get  company by transactionId
router.get(
  "/:transactionId",
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const company = await Company.findOne({
      transactionId,
    });

    res.json(company);
  })
);

//@GET Get all  company by transactionId
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const company = await Company.findOne({
      transactionId,
    });

    res.json(company);
  })
);

//@POST Add new Company
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newCompany = req.body;

    const createdCompany = await Company.create(newCompany);

    if (_.isEmpty(createdCompany)) {
      return res
        .status(404)
        .json("Error saving Company Info.Try again later!!!");
    }
    res.sendStatus(201);
  })
);

//@PUT update company info
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedCompany = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json("invalid company id");
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
        .json("Error saving Company Info.Try again later!!!");
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove Company by id

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    if (typeof id === "string") {
      const removedCompany = await Company.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === "object") {
      id.map(async ({ _id }) => {
        await Company.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;