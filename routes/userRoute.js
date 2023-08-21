const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const multer = require('multer');
const { randomUUID } = require('crypto');
const User = require('../models/userModel');

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
    // console.log(users);

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

    console.log(req.body);
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
    const isTrue = await bcrypt.compare(oldPassword, user.password);
    if (!isTrue) {
      return res.status(404).json('Password is incorrect!!!');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(id, {
      password: hashedPassword,
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
    //console.log(id);

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
