// Copyright 2019, Google, Inc.
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

// [START traineeshelf_firestore_client]
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();
const collection = 'Trainee';

// [END traineeshelf_firestore_client]

// Lists all trainees in the database sorted alphabetically by title.
async function list(limit, token) {
  const snapshot = await db
    .collection(collection)
    .orderBy('title')
    .startAfter(token || '')
    .limit(limit)
    .get();

  if (snapshot.empty) {
    return {
      trainees: [],
      nextPageToken: false,
    };
  }
  const trainees = [];
  snapshot.forEach((doc) => {
    let trainee = doc.data();
    trainee.id = doc.id;
    trainees.push(trainee);
  });
  const q = await snapshot.query.offset(limit).get();

  return {
    trainees,
    nextPageToken: q.empty ? false : trainees[trainees.length - 1].title,
  };
}

// Creates a new trainee or updates an existing trainee with new data.
async function update(id, data) {
  let ref;
  if (id === null) {
    ref = db.collection(collection).doc();
  } else {
    ref = db.collection(collection).doc(id);
  }

  data.id = ref.id;
  data = {...data};
  await ref.set(data);
  return data;
}

async function create(data) {
  return await update(null, data);
}

// [START traineeshelf_firestore_client_get_trainee]
async function read(id) {
  const doc = await db.collection(collection).doc(id).get();

  if (!doc.exists) {
    throw new Error('No such document!');
  }
  return doc.data();
}
// [END traineeshelf_firestore_client_get_trainee]

async function _delete(id) {
  await db.collection(collection).doc(id).delete();
}

module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list,
};
