module.exports = function logBody(req, res, next) {
  try {
    const preview = JSON.stringify(req.body).slice(0, 300);
    console.log(`[LOG] ${req.method} ${req.originalUrl} body:`, preview);
  } catch (e) {
    console.log('[LOG] unable to stringify body');
  }
  next();
}
