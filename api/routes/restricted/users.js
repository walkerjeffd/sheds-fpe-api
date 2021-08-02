const express = require('express')
const asyncHandler = require('express-async-handler')

const router = express.Router()

const {
  getUser,
  postUser,
  putUser,
  deleteUser
} = require('../../controllers/users')

router.route('/:userId')
  .get(asyncHandler(getUser))
  .post(asyncHandler(postUser))
  .put(asyncHandler(putUser))
  .delete(asyncHandler(deleteUser))

module.exports = router