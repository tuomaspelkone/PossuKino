import express from 'express';
import * as controller from '../controllers/group_movies_controller.js';
import requireAuth from '../middleware/auth.js';

const router = express.Router();

// GET /group_movies?group_id=123
router.get('/', controller.getGroupMovies);

// GET /group_movies/:group_id
router.get('/:group_id', controller.getGroupMovies);

// POST /group_movies  (requires auth)
router.post('/', requireAuth, controller.addGroupMovie);
// DELETE /group_movies/:group_movie_id (requires auth, admin)
router.delete('/:group_movie_id', requireAuth, controller.deleteGroupMovie);

export default router;
