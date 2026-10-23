/** Transmet les erreurs des gestionnaires asynchrones au middleware d'erreurs. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
