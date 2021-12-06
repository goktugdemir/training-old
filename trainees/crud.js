// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const images = require('../lib/images');
const db = require('./firestore');

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({extended: false}));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /trainees
 *
 * Display a page of trainees (up to ten at a time).
 */
router.get('/', async (req, res) => {
  let {trainees, nextPageToken} = await db.list(10, req.query.pageToken);
  res.render('trainees/list.pug', {
    trainees,
    nextPageToken,
  });
});

/**
 * GET /trainees/add
 *
 * Display a form for creating a trainee.
 */
router.get('/add', (req, res) => {
  res.render('trainees/form.pug', {
    trainee: {},
    action: 'Add',
  });
});

/**
 * POST /trainees/add
 *
 * Create a trainee.
 */
// [START add]
router.post(
  '/add',
  images.multer.single('image'),
  images.sendUploadToGCS,
  async (req, res) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
    const savedData = await db.create(data);
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  }
);
// [END add]

/**
 * GET /trainees/:id/edit
 *
 * Display a trainee for editing.
 */
router.get('/:trainee/edit', async (req, res) => {
  const trainee = await db.read(req.params.trainee);
  res.render('trainees/form.pug', {
    trainee,
    action: 'Edit',
  });
});

/**
 * POST /trainees/:id/edit
 *
 * Update a trainee.
 */
router.post(
  '/:trainee/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  async (req, res) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    const savedData = await db.update(req.params.trainee, data);
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  }
);

/**
 * GET /trainees/:id
 *
 * Display a trainee.
 */
router.get('/:trainee', async (req, res) => {
  const trainee = await db.read(req.params.trainee);
  res.render('trainees/view.pug', {
    trainee,
  });
});

/**
 * GET /trainees/:id/delete
 *
 * Delete a trainee.
 */
router.get('/:trainee/delete', async (req, res) => {
  await db.delete(req.params.trainee);
  res.redirect(req.baseUrl);
});

module.exports = router;
