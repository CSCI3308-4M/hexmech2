'use strict';
/**
 * @module routes/login
 * @description ExpressJS route for login page.
 **/
const express = require('express');
const _ = require('underscore');
const httpError = require('http-error');
const packageConfig = require('packageConfig');
const User = require('../models/user.js');


const router = new express.Router();


/**
 * @typedef BasicData
 * @type Object
 * @property {String} title - The page title.
 * @property {String} signupURL - URL of signup page.
 * @property {String} loginURL - URL of login page.
 */

/**
 * Return basic data for template.
 * @return {BasicData}
 */
function getData() {
  return {
    title: packageConfig.name,
    signupURL: 'signup',
    loginURL: 'login',
  };
}


/**
 * Return prefill object for template.
 * @param {Object} err - Error object.
 * @param {Object} post - Object containing parsed form fields.
 * @return {Object} - Filled form fields (excluding the password field).
 */
function getPrefill(err, post) {
  const prefill = {};
  let keys = _.difference(Object.keys(post), Object.keys(err));
  keys = _.without(keys, 'password', 'confirmPassword');
  keys.forEach((key) => {
    prefill[key] = post[key];
  });
  return prefill;
}


/**
 * Re-render page with flash messages (saves form fields).
 * @param {Object[]} err - Error object.
 * @param {String} err.msg - Message to display.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 */
function flashError(err, req, res) {
  const data = getData();
  data.prefill = getPrefill(err, req.body);
  data.flash = {
    type: 'alert-danger',
    messages: err,
  };
  res.render('signup', data);
}


/**
 * Validates the signup form (server side).
 *
 * Stores result in the request object.
 * @param {Object} req - Request object.
 */
function validate(req) {
  req.checkBody({
    displayName: {
      notEmpty: {
        errorMessage: 'Display Name is required.',
      },
    },
    username: {
      username: {
        errorMessage: 'Username cannot contain spaces.',
      },
      notEmpty: {
        errorMessage: 'Username is required.',
      },
    },
    email: {
      isEmail: {
        errorMessage: 'Please enter a valid email address.',
      },
      notEmpty: {
        errorMessage: 'Email Address is required.',
      },
    },
    confirmEmail: {
      equals: {
        options: [req.body.email],
        errorMessage: 'Email addresses do not match.',
      },
    },
    password: {
      isLength: {
        options: [{ min: 6, max: 160 }],
        errorMessage: 'Password must be between 6 and 160 characters.',
      },
      notEmpty: {
        errorMessage: 'Password is required.',
      },
    },
    confirmPassword: {
      equals: {
        options: [req.body.password],
        errorMessage: 'Passwords do not match.',
      },
    },
  });
}


/**
 * Save user into database.
 * @param {module:models/user~User} user - Database user object.
 * @param {Function} next - Generic callback (can be passed error object).
 */
function saveUser(user, next) {
  user.save((err) => {
    if (err) {
      console.error(err);
      next(err);
    } else {
      console.log(`User "${user.username}" successfully registered.`);
      next();
    }
  });
}


/**
 * Register a new user who sent request.
 *
 * User fields given in request body.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Generic callback.
 */
function register(req, res, next) {
  // check for existing username
  User.count({ username: req.body.username }, (err, count) => {
    // handle case of dumplicate username
    if (count > 0) {
      flashError([{ msg: 'Username already exists.' }], req, res);
      return;
    }

    // set plain text fields
    const user = new User({
      displayName: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      admin: false,
      created: new Date(),
    });

    // set password and save
    user.setPassword(req.body.password, () => {
      saveUser(user, next);
    });
  });
}


/**
 * GET signup page.
 *
 * Can only respond to HTML request.
 * @function
 * @name /signup
 */
router.get('/', (req, res, next) => {
  res.format({
    'text/html'() {
      res.render('signup', getData());
    },
    'default'() {
      // log the request and respond with 406
      next(httpError(406));
    },
  });
});


/**
 * POST signup page.
 *
 * This registers a new user given the user info supplied in the request body.
 * @function
 * @name /signup
 */
router.post('/', (req, res, next) => {
  // sanitize the input
  req.sanitizeBody('displayName').trim();

  // validate the input
  validate(req);

  // check for validation errors
  const err = req.validationErrors(true);
  if (err) {
    console.error(err);
    flashError(err, req, res);
    return;
  }

  // register user
  register(req, res, (err_) => {
    if (err_) {
      console.error(err_);
      next(httpError(500));
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
