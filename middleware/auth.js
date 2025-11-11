//middleware es como un "guardián" o "filtro" que revisa las peticiones antes de que lleguen al código.
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/iniciosesion');
  }
  next();
};

module.exports = { requireAuth };
