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
 * GET /api/trainees
 *
 * Retrieve a page of trainees (up to ten at a time).
 */
router.get('/', async (req, res) => {
  const {trainees, nextPageToken} = await db.list(10, req.query.pageToken);
  res.json({
    items: trainees,
    nextPageToken,
  });
});

/**
 * POST /api/trainees
 *
 * Create a new trainee.
 */
router.post('/', async (req, res) => {
  const trainee = await db.create(req.body);
  res.json(trainee);
});

/**
 * GET /api/trainees/:id
 *
 * Retrieve a trainee.
 */
router.get('/:trainee', async (req, res) => {
  const trainee = await db.read(req.params.trainee);
  res.json(trainee);
});

/**
 * PUT /api/trainees/:id
 *
 * Update a trainee.
 */
router.put('/:trainee', async (req, res) => {
  const trainee = await db.update(req.params.trainee, req.body);
  res.json(trainee);
});

/**
 * DELETE /api/trainees/:id
 *
 * Delete a trainee.
 */
router.delete('/:trainee', async (req, res) => {
  await db.delete(req.params.trainee);
  res.status(200).send('OK');
});

module.exports = router;
