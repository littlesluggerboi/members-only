const authenticateMiddleware = async (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.redirect("/login");
  }
  next();
};

export default { authenticateMiddleware };
