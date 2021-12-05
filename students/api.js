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
const db = require('./firestore');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/students
 *
 * Retrieve a page of students (up to ten at a time).
 */
router.get('/', async (req, res) => {
  const {students, nextPageToken} = await db.list(10, req.query.pageToken);
  res.json({
    items: students,
    nextPageToken,
  });
});

/**
 * POST /api/students
 *
 * Create a new student.
 */
router.post('/', async (req, res) => {
  const student = await db.create(req.body);
  res.json(student);
});

/**
 * GET /api/students/:id
 *
 * Retrieve a student.
 */
router.get('/:student', async (req, res) => {
  const student = await db.read(req.params.student);
  res.json(student);
});

/**
 * PUT /api/students/:id
 *
 * Update a student.
 */
router.put('/:student', async (req, res) => {
  const student = await db.update(req.params.student, req.body);
  res.json(student);
});

/**
 * DELETE /api/students/:id
 *
 * Delete a student.
 */
router.delete('/:student', async (req, res) => {
  await db.delete(req.params.student);
  res.status(200).send('OK');
});

module.exports = router;
