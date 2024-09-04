function abort(res, statusCode, message) {
  res.statusCode = statusCode;
  res.json({ error: message });
}

export default abort;
