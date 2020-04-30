const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    // Validation check for text.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      // Brings in the current user object, removes password.
      const user = await User.findById(req.user.id).select('-password');
      // Create object for new Post to be created.
      // Need to instantiate the Post Schema " new Post " object or will return error on save().
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      // Binds newPost save request to a post variable.
      const post = await newPost.save();
      // Send back the submitted post.
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error.');
    }
  },
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    // Sorts by most recent first.
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ msg: 'Post not found.' });
    }
    res.status(500).send('Server Error.');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete Post by ID
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // @TODO - archive instead of delete as primary route. Or have some kind of delete history.
    const post = await Post.findById(req.params.id);
    // Check post exists
    if (!post) {
      res.status(404).json({ msg: ' Post not found.' });
    }
    // Check User
    // Need to use toString() method, as post.user is a JSON object, not a string.
    if (post.user.toString() !== req.user.id) {
      res.status(401).json({ msg: 'User not authorized.' });
    }
    await post.remove();
    res.json({ msg: 'Post removed.' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ msg: 'Post not found. ' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if Post has already been liked.
    // Logical check filters through likes.
    // If it finds this user already signed, does not add a new like.
    if (
      // prettier-ignore
      post.likes.filter((like) => like.user.toString() === req.user.id).length > 0
    ) {
      res.status(400).json({ msg: 'Post already liked.' });
    }
    // Add in a like, signed by User ID.
    post.likes.unshift({ user: req.user.id });
    // Save to DB.
    await post.save();
    // Send likes to Front End
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if Post has already been liked.
    // Logical check filters through likes.
    // If it finds this user has not liked the post, does not unlike..
    if (
      // prettier-ignore
      post.likes.filter((like) => like.user.toString() === req.user.id).length === 0
    ) {
      res.status(400).json({ msg: 'Post has not yet been liked.' });
    }
    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    // Remove liked post.
    await post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      // Get user ID
      const user = await User.findById(req.user.id).select('-password');
      // Get post ID
      const post = await Post.findById(req.params.id);
      // Build temp object for the new comment
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      // Add to posts object.
      post.comments.unshift(newComment);

      // Save in DB
      await post.save();
      // Send back the comments
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error.');
    }
  },
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete a comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Pull out Comment by ID
    // Find() takes in a function
    const commentDel = post.comments.find(
      (comment) => comment.id === req.params.comment_id,
    );
    // Make sure comment exists
    if (!commentDel) {
      res.status(404).json({ msg: 'Comment does not exist.' });
    }
    // Check User
    if (commentDel.user.toString() !== req.user.id) {
      res.status(401).json({ msg: 'User not authorized.' });
    }
    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    // Remove comment.
    await post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

module.exports = router;
