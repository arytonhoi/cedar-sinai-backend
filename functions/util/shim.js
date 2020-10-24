exports.fixFormat = (req) => {
  req.body = JSON.parse(req.rawBody.toString());
  return req
}

