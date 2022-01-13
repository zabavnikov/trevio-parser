const { Sequelize } = require('sequelize');

const AlbumsCount = [
  Sequelize.literal(`(
    SELECT COUNT(*)
    FROM notes
    WHERE
      notes.travel_id = Travel.id
      AND
      notes.note_type_id = 4
      AND
      notes.status = 'published'
  )`),
  'albums_count'
];

const NotesCount = [
  Sequelize.literal(`(
    SELECT COUNT(*)
    FROM notes
    WHERE
      notes.travel_id = Travel.id
      AND
      notes.note_type_id NOT IN (3,4,5,8)
      AND
      notes.status = 'published'
  )`),
  'notes_count'
];

const ReviewsCount = [
  Sequelize.literal(`(
    SELECT COUNT(*)
    FROM notes
    WHERE
      notes.travel_id = Travel.id
      AND
      notes.note_type_id IN (3,5)
      AND
      notes.status = 'published'
  )`),
  'reviews_count'
];

const QuestionsCount = [
  Sequelize.literal(`(
    SELECT COUNT(*)
    FROM notes
    WHERE
      notes.travel_id = Travel.id
      AND
      notes.note_type_id = 8
      AND
      notes.status = 'published'
  )`),
  'questions_count'
];

module.exports = { AlbumsCount, NotesCount, ReviewsCount, QuestionsCount }