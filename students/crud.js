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
 * GET /students
 *
 * Display a page of students (up to ten at a time).
 */
router.get('/', async (req, res) => {
  let {students, nextPageToken} = await db.list(10, req.query.pageToken);
  res.render('students/list.pug', {
    students,
    nextPageToken,
  });
});

/**
 * GET /students/add
 *
 * Display a form for creating a student.
 */
router.get('/add', (req, res) => {
  res.render('students/form.pug', {
    student: {},
    action: 'Add',
  });
});

/**
 * POST /students/add
 *
 * Create a student.
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
 * GET /students/:id/edit
 *
 * Display a student for editing.
 */
router.get('/:student/edit', async (req, res) => {
  const student = await db.read(req.params.student);
  res.render('students/form.pug', {
    student,
    action: 'Edit',
  });
});

/**
 * POST /students/:id/edit
 *
 * Update a student.
 */
router.post(
  '/:student/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  async (req, res) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    const savedData = await db.update(req.params.student, data);
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  }
);

/**
 * GET /students/:id
 *
 * Display a student.
 */
router.get('/:student', async (req, res) => {
  const student = await db.read(req.params.student);
  res.render('students/view.pug', {
    student,
  });
});

/**
 * GET /students/:id/delete
 *
 * Delete a student.
 */
router.get('/:student/delete', async (req, res) => {
  await db.delete(req.params.student);
  res.redirect(req.baseUrl);
});

module.exports = router;
