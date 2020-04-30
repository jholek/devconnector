/* eslint-disable no-console */
// --- Packages ---
const express = require('express');
// const request = require('request');
// const config = require('config');
const { check, validationResult } = require('express-validator');
// --- Middleware and Routes ---
const router = express.Router();
const auth = require('../../middleware/auth');
// --- Models ---
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route    GET api/profile/me
// @desc     Get current user's profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    // Finding profile based on the UserID for the current user session. uses Token to authenticate.
    const profile = await Profile.findOne({
      user: req.user.id,
      // populate() brings in fields from the user model.
    }).populate('user', ['name', 'avatar']);
    // Returns error if no profile is found.
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    // If profile is found, sends it.
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create / Update user profile
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').not().isEmpty(),
      check('skills', 'Skillls is required.').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Handling Validation checks.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // --- Destructuring req.body ---
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // --- Building Profile Object ---
    const profileFields = {};
    // No matter what we need to relate user to profile.
    profileFields.user = req.user.id;
    // Since these are not mandatory, we only bind if they exist.
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // Since skills is a string of CSV, we need to clean it up and make it an array.
    // split() turns string into array. Pass in the deliminator
    // trim() removes whitespace on either side of the string
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // --- Building Social Object ---
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });

      if (profile) {
        // Updates profile if it exists.
        // First argument is which document to update.
        // Second Argument is what to update.
        // Third argument is determining what document state will be returned. New or old.
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true },
        );
        return res.json(profile);
      }

      // Creates a profile if one does not exist.
      if (!profile) {
        profile = new Profile(profileFields);
        // Save() will write the profile object to the DB.
        await profile.save();
        return res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  },
);

// @route    GET api/profile
// @desc     Get all profiles.
// @access   Public
router.get('/', async (req, res) => {
  try {
    // Using find() to grab all profiles. populate() will bring in the name and avatar
    // values instead of just the id associated.
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    // Looks for a Profile by using the user ID in the URL (via params)
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      res.status(400).json({ msg: 'Profile not found.' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    // Adding in a check to see if the invalid ID is a viable Object.
    if (err.kind === 'ObjectId') {
      res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/profile
// @desc     Delete Profile, User & Posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user's posts
    await Post.deleteMany({ user: req.user.id });
    // @TODO - archive instead of delete as primary route. Or have some kind of delete history.
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User Deleted.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/experience
// @desc     Add in Profile Experience
// @access   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'Starting Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    // Destructure
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    // Build Object
    // The syntax for object mapping is shortened from
    // title: title as example since we destructured.
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      // Update method based on profile and user ID token
      const profile = await Profile.findOne({ user: req.user.id });
      // Similar to push(), but adds content at the beginning of the array instead.
      // This means the most recent experience is at the top.
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete Profile Experience
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get index to Remove
    // Mapping through all experiences, by getting the ids.
    // req.params.exp_id is defined in the URL, and passed into the indexOf
    // The index associated with the submitted ID is then saved as removeIndex.
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    // Remove the object inside the experience array associated with the index found.
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/education
// @desc     Add in Profile Education
// @access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
      check('from', 'Starting Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    // Destructure
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    // Build Object
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete Profile Education
// @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- GITHUB API DEPRECATED ---
// // @route    GET api/profile/github/:username
// // @desc     Get user repos from Github.
// // @access   Public
// router.get('/github/:username', async (req, res) => {
//   try {
//     // Uses the github api keys stored in config to create the URI string.
//     // Method and headers are needed to speak to the Github API properly.
//     const options = {
//       uri: `https://api.github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id=${config.get(
//         'githubClientId',
//       )}&client_secret=${config.get('githubSecret')}`,
//       method: 'GET',
//       headers: { 'user-agent': 'node.js' },
//     };
//     // Uses request module to pass in the request to Github, structured above.
//     // Checks for errors or if a Github can't be found.
//     request(options, (error, response, body) => {
//       if (error) {
//         console.error(error);
//       }
//       if (response.statusCode !== 200) {
//         res.status(404).json({ msg: 'No Github profile found.' });
//       }
//       console.log(body);
//       // body by itself is just a regular string.
//       // Need to surround it by JSON.parse to structure it properly.
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;
