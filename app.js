const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect('mongodb://localhost:27017/casino-spin-house', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = mongoose.model('User', {
  nombre: String,
  fechaNacimiento: Date,
  email: String,
  usuario: String,
  password: String,
  saldo: { type: Number, default: 50000 }
});


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.use(session({
  secret: 'clave-secreta-temporal',
  resave: false,
  saveUninitialized: false
}));


app.post('/registro', async (req, res) => {
  try {
    const { nombre, fecha_nac_r, correo_r, user_r, pass_r } = req.body;
    
    const hashedPassword = await bcrypt.hash(pass_r, 10);
    const user = new User({
      nombre,
      fechaNacimiento: fecha_nac_r,
      email: correo_r,
      usuario: user_r,
      password: hashedPassword
    });
    
    await user.save();
    req.session.userId = user._id;
    res.redirect('/perfil.html'); 
    
  } catch (error) {
    res.redirect('/registro.html?error=1');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { usuario_casino, clave_oculta } = req.body;
    const user = await User.findOne({ usuario: usuario_casino });
    
    if (user && await bcrypt.compare(clave_oculta, user.password)) {
      req.session.userId = user._id;
      res.redirect('/perfil.html');
    } else {
      res.redirect('/iniciosesion.html?error=1');
    }
  } catch (error) {
    res.redirect('/iniciosesion.html?error=1');
  }
});


app.get('/api/saldo', async (req, res) => {
  if (!req.session.userId) return res.json({ saldo: 0 });
  
  const user = await User.findById(req.session.userId);
  res.json({ saldo: user.saldo });
});

app.listen(3000, () => {
  console.log('Servidor funcionando en http://localhost:3000');
});
