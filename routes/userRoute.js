const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const multer = require('multer');
const { randomUUID } = require('crypto');
const User = require('../models/userModel');
const {
  Types: { ObjectId },
} = require('mongoose');
const PC = require('../models/pcModel');
const Dispatcher = require('../models/dispatcherModel');
const Company = require('../models/companyModel');

const PCTransaction = require('../models/pcTransactionModel');
const DispatcherTransaction = require('../models/dispatcherTransactionModel');
const CompanyTransaction = require('../models/companyTransactionModel');

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/users/');
  },
  filename: function (req, file, cb) {
    const ext = file?.originalname?.split('.')[1];

    cb(null, `${randomUUID()}.${ext}`);
  },
});
const upload = multer({ storage: Storage });

//@PGET all users
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');

    // if (_.isEmpty(users)) {
    //   return res.status(404).json("Error fetching user information");
    // }
    res.json(users);
  })
);

//@PGET all users
router.get(
  '/verify',
  asyncHandler(async (req, res) => {
    const { id } = req.session.user;
    const user = await User.findById(id).select('-password');

    loggedInUser = {
      id: user._id,
      profile: user.profile,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      active: user.active,
    };
    res.json(loggedInUser);
  })
);

//@GET user by username
router.get(
  '/:id/customers',
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const company = await Company.find({
      user: ObjectId(id),
    }).count();
    const dispatcher = await Dispatcher.find({
      user: ObjectId(id),
    }).count();
    const pc = await PC.find({
      user: ObjectId(id),
    }).count();

    res.status(200).json({
      company,
      pc,
      dispatcher,
      total: Number(pc) + Number(company) + Number(dispatcher),
    });
  })
);

//@GET user by username

router.get(
  '/:id/transactions',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await CompanyTransaction.find({
      user: ObjectId(id),
    }).count();

    const pc = await PCTransaction.find({
      user: ObjectId(id),
    }).count();

    const dispatcher = await DispatcherTransaction.find({
      user: ObjectId(id),
    }).count();

    const total = Number(pc + company + dispatcher);

    res.status(200).json({
      pc: _.isNaN(pc) ? 0 : pc,
      pcp: _.isNaN((Number(pc / total) * 100)?.toFixed(2))
        ? 0
        : (Number(pc / total) * 100)?.toFixed(2),
      company: _.isNaN(company) ? 0 : company,
      companyp: _.isNaN((Number(company / total) * 100)?.toFixed(2))
        ? 0
        : (Number(company / total) * 100)?.toFixed(2),
      dispatcher: _.isNaN(dispatcher) ? 0 : dispatcher,
      dispatcherp: _.isNaN((Number(dispatcher / total) * 100)?.toFixed(2))
        ? 0
        : (Number(dispatcher / total) * 100)?.toFixed(2),
      total,
    });
  })
);
router.get(
  '/:id/advances',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await CompanyTransaction.find({
      user: ObjectId(id),
    }).select('company date advance');

    const pc = await PCTransaction.find({
      user: ObjectId(id),
    }).select('pc date advance');

    const dispatcher = await DispatcherTransaction.find({
      user: ObjectId(id),
    }).select('dispatcher date closingStock');

    const companySum = _.sumBy(company, 'advance');
    const pcSum = _.sumBy(pc, 'advance');
    const dispatcherSum = _.sumBy(dispatcher, 'closingStock');

    res.status(200).json({
      pc: pcSum,
      company: companySum,
      dispatcher: dispatcherSum,
      total: Number(pcSum + companySum + dispatcherSum),
    });
  })
);
//@GET user by username
router.get(
  '/:id/outstandings',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    //company
    const companies = await Company.find({
      user: new ObjectId(id),
    });

    const companyTransaction = companies.map(async (company) => {
      const transaction = await CompanyTransaction.find({
        user: new ObjectId(id),
        company: new ObjectId(company?._id),
      });

      if (!_.isEmpty(transaction)) {
        const lastTransaction = _.last(
          _.orderBy(transaction, 'createdAt', 'asc')
        );

        return {
          advance: lastTransaction?.advance,
          advanceCummulative: lastTransaction?.advanceCummulative,
          grns: lastTransaction?.grns,
          grnsCummulative: lastTransaction?.grnsCummulative,
          outstanding: lastTransaction?.outstanding,
        };
      }
    });

    const companySummary = await Promise.all(companyTransaction);
    const filteredCompanies = companySummary.filter(
      (item) => item !== undefined
    );
    //  console.log(companySummary)

    //clerks
    const clerks = await PC.find({
      user: new ObjectId(id),
    });

    const clerksTransaction = clerks.map(async (clerk) => {
      const transaction = await PCTransaction.find({
        user: new ObjectId(id),
        pc: new ObjectId(clerk?._id),
      });

      if (!_.isEmpty(transaction)) {
        const lastTransaction = _.last(
          _.orderBy(transaction, 'createdAt', 'asc')
        );

        return {
          advance: lastTransaction?.advance,
          advanceCummulative: lastTransaction?.advanceCummulative,
          delivered: lastTransaction?.delivered,
          deliveredCummulative: lastTransaction?.deliveredCummulative,
          outstanding: lastTransaction?.outstanding,
        };
      }
    });

    const clerkSummary = await Promise.all(clerksTransaction);
    const filteredClerks = clerkSummary.filter((item) => item !== undefined);

    // console.log(filteredCompanies, filteredClerks);
    const companyOutStanding = _.sumBy(filteredCompanies, 'outstanding');
    const pcOutStanding = _.sumBy(filteredClerks, 'outstanding');

    return res.status(200).json({
      pc: pcOutStanding,
      company: companyOutStanding,
      dispatcher: 0,
      total: Number(companyOutStanding + pcOutStanding),
    });

    // const company = await CompanyTransaction.find({
    //   user: ObjectId(id),
    // })
    //   .select('company date outstanding')
    //   .sort({ date: 'desc' });

    // const pc = await PCTransaction.find({
    //   user: ObjectId(id),
    // })
    //   .select('pc date outstanding')
    //   .sort({ date: 'desc' });

    // const dispatcher = await DispatcherTransaction.find({
    //   user: ObjectId(id),
    // }).select('closingStock quantity');

    // const com = _.groupBy(company, 'company');
    // const pcd = _.groupBy(pc, 'pc');

    // const c = Object?.values(com)?.map((cd) => {
    //   return {
    //     _id: cd[0]._id,
    //     date: cd[0]?.date,
    //     customer: cd[0]?.company,
    //     outstanding: cd[0].outstanding,
    //   };
    // });

    // const sumOfCompanyOutstanding = _.sumBy(c, 'outstanding');

    // const p = Object?.values(pcd)?.map((cd) => {
    //   return {
    //     _id: cd[0]._id,
    //     date: cd[0]?.date,
    //     customer: cd[0]?.pc,
    //     outstanding: cd[0].outstanding,
    //   };
    // });

    // const sumOfPCOutstanding = _.sumBy(p, 'outstanding');

    // const sumOfDispatcherOutstanding =
    //   _.sumBy(dispatcher, 'closingStock') - _.sumBy(dispatcher, 'quantity');

    // res.status(200).json({
    //   pc: sumOfPCOutstanding,
    //   company: sumOfCompanyOutstanding,
    //   dispatcher: sumOfDispatcherOutstanding,
    //   total: Number(
    //     sumOfCompanyOutstanding +
    //       sumOfPCOutstanding +
    //       sumOfDispatcherOutstanding
    //   ),
    // });
  })
);

//@GET user by username
router.get(
  '/:id/sales',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { year } = req.query;

    const company = await CompanyTransaction.find({
      user:new ObjectId(id),
    })
      .select('company  date month year advanceCummulative outstanding')
      .sort({ createdAt: 'desc' });

    const pc = await PCTransaction.find({
      user:new ObjectId(id),
    })
      .select('pc date month year advanceCummulative outstanding')
      .sort({ createdAt: 'desc' });

    const dispatcher = await DispatcherTransaction.find({
      user:new ObjectId(id),
    })
      .select('date month year closingStock quantity dispatcher')
      .sort({ createdAt: 'desc' });

    const com = _.groupBy(
      _.filter(company, (item) => item?.year === parseInt(year)),
      'company'
    );
    const pcd = _.groupBy(
      _.filter(pc, (item) => item?.year === parseInt(year)),
      'pc'
    );
    const dis = _.groupBy(
      _.filter(dispatcher, (item) => item?.year === parseInt(year)),
      'dispatcher'
    );

    const c = Object?.values(com)?.map((cd) => {
      return {
        _id: cd[0]._id,
        date: cd[0]?.date,
        month: cd[0]?.month,
        customer: cd[0]?.company,
        advance: cd[0].advanceCummulative,
        outstanding: cd[0].outstanding,
      };
    });

    const p = Object?.values(pcd)?.map((cd) => {
      return {
        _id: cd[0]._id,
        date: cd[0]?.date,
        month: cd[0]?.month,
        customer: cd[0]?.pc,
        advance: cd[0].advanceCummulative,
        outstanding: cd[0].outstanding,
      };
    });

    const d = Object?.values(dis)?.map((cd) => {
      return {
        _id: cd[0]._id,
        date: cd[0]?.date,
        month: cd[0]?.month,
        customer: cd[0]?.dispatcher,
        advance: _.sumBy(cd, 'closingStock'),
        outstanding: _.sumBy(cd, 'quantity'),
      };
    });

    const data = await Promise.all([p, c, d]);

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const flatData = _.flatMap(data).sort((a, b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    const groupedData = _.groupBy(flatData, 'month');
    const labels = Object.keys(groupedData);

    const values = Object?.values(groupedData)?.map((cd) => {
      return {
        advance: _.sumBy(cd, 'advance'),
        outstanding: _.sumBy(cd, 'outstanding'),
      };
    });

    res.status(200).json({
      labels,
      values,
    });
  })
);

//@GET user by username
router.post(
  '/auth',
  asyncHandler(async (req, res) => {
    const username = req.body.username;
    const user = await User.findByUsername(username);

    if (_.isEmpty(user[0])) {
      return res.status(404).json(' Username or Password is incorrect !');
    }
    // const isTrue = bcrypt.compareSync(req.body.password, user[0].password);
    const isTrue = req.body.password === user[0].password;
    if (!isTrue) {
      return res.status(404).json(' Username or Password is incorrect !');
    }

    if (user[0].active === false) {
      return res
        .status(404)
        .json(
          'Your account has been disabled! Try contacting your administrator.'
        );
    }

    loggedInUser = {
      id: user[0]._id,
      image: user[0].profile,
      fullname: `${user[0].firstName} ${user[0].lastName}`,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      username: user[0].username,
      email: user[0].email,
      phone: user[0].phone,
      active: user[0].active,
    };

    res.status(200).json(loggedInUser);
  })
);

//@POST add new user
router.post(
  '/',
  // upload.single('profile'),
  asyncHandler(async (req, res) => {
    const newUser = req.body;
    const username = req.body.username;

    const itExists = await User.findOne({ username });
    if (!_.isEmpty(itExists)) {
      return res
        .status(404)
        .json('An account with this Username already exits!');
    }

    // const hashedPassword = await bcrypt.hash(newUser.password, 10);
    // newUser.password = hashedPassword;
    // newUser.profile = req.file?.filename;

    const user = await User.create(newUser);

    if (!user) {
      return res.status(404).json('Error Saving user info!');
    }

    res.status(201).json('New user has been added successfully!!!');
  })
);

//@Update User Information
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   req.body.password = hashedPassword;
    // } else {
    //   delete req.body.password;
    // }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info.Try Again Later.');
    }

    loggedInUser = {
      id: updatedUser._id,
      image: updatedUser.profile,
      fullname: `${updatedUser.firstName} ${updatedUser.lastName}`,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      active: updatedUser.active,
    };

    res.status(200).json(loggedInUser);
  })
);

//@POST Update User profile
router.put(
  '/profile',
  upload.single('profile'),
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          profile: req.file?.filename,
        },
      },
      { new: true, upsert: true }
    );

    if (_.isEmpty(updatedUser)) {
      return res
        .status(400)
        .json('Error updating profile image.Try again later.');
    }

    loggedInUser = {
      id: updatedUser._id,
      image: updatedUser.profile,
      fullname: `${updatedUser.firstName} ${updatedUser.lastName}`,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      active: updatedUser.active,
    };

    res.status(200).json(loggedInUser);
  })
);

//@PUT add new user
router.get(
  '/admin/add/:token',
  asyncHandler(async (req, res) => {
    const token = req.params.token;

    if (token !== process.env.TOKEN) {
      return res.sendStatus(403);
    }
    const newUser = {
      fullname: 'Nick Test',
      username: 'admin',
      gender: 'male',
      email: 'nicktest701@gmail.com',
      password: 'Akwasi21guy',
      role: 'administrator',
      phonenumber: '0543772591',
    };

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    const user = await User.create(newUser);
    if (!user) {
      return res.status(404).json('Error Saving user info!');
    }

    res.json('done');
  })
);

//@PUT Reset Password
router.put(
  '/reset',
  asyncHandler(async (req, res) => {
    const { id, oldPassword, newPassword } = req.body;
    const user = await User.findById(id);

    if (_.isEmpty(user)) {
      return res.status(404).json('User does not exist');
    }
    const isTrue = oldPassword === user.password;
    if (!isTrue) {
      return res.status(404).json('Password is incorrect!!!');
    }

    const updatedUser = await User.findByIdAndUpdate(id, {
      password: newPassword,
    });

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info.Try Again Later.');
    }

    res.json('User information updated !!!');
  })
);

//@POST Reset User Password
router.put(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info.Try Again Later.');
    }

    res.status(200).json('Password updated !!!');
  })
);

//@PUT Reset Password
router.patch(
  '/admin/reset-password',
  asyncHandler(async (req, res) => {
    const { id, password } = req.body;
    const user = await User.findById(id);

    if (_.isEmpty(user)) {
      return res.status(404).json('User does not exist');
    }

    const hashedPassword = await bcrypt.hash(password?.trim(), 10);

    const updatedUser = await User.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info.Try Again Later.');
    }

    res.json('User password updated !!!');
  })
);

router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info');
    }

    res.status(200).json(true);
  })
);

//Enable or Disable User Account
router.put(
  '/account',
  asyncHandler(async (req, res) => {
    const { id, active } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { active } },
      {
        new: true,
      }
    );

    if (_.isEmpty(updatedUser)) {
      return res.status(404).json('Error updating user info');
    }

    res.json(
      updatedUser.active === true
        ? 'User account enabled'
        : 'User account disabled'
    );
  })
);

//@DELETE student
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(401).json('Invalid User information');
    }

    const user = await User.findByIdAndRemove(id, {
      new: true,
    });

    if (_.isEmpty(user)) {
      return res.status(403).json('No User with such id');
    }
    res.status(200).json('User has been removed successfully !!!');
  })
);

module.exports = router;
