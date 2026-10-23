import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { classIdParamsSchema, createClassBodySchema, joinClassBodySchema } from '../schemas/classes.js';
import { createClass, getClassProgress, joinClass, listClasses } from '../services/classesService.js';

export function classesRoutes() {
  const router = Router();
  const teachersOnly = requireRole('teacher', 'admin');

  // Enseignant : ses classes. Élève : les classes qu'il a rejointes (RLS).
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json({ classes: await listClasses(req.auth.db) });
    }),
  );

  router.post(
    '/',
    teachersOnly,
    asyncHandler(async (req, res) => {
      const body = createClassBodySchema.parse(req.body);
      res.status(201).json(await createClass(req.auth.db, req.auth.userId, body));
    }),
  );

  router.post(
    '/join',
    asyncHandler(async (req, res) => {
      const { code } = joinClassBodySchema.parse(req.body);
      res.json(await joinClass(req.auth.db, code));
    }),
  );

  router.get(
    '/:id/progress',
    teachersOnly,
    asyncHandler(async (req, res) => {
      const { id } = classIdParamsSchema.parse(req.params);
      res.json(await getClassProgress(req.auth.db, id));
    }),
  );

  return router;
}
