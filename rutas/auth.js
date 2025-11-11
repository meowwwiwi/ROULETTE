const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

//maneja registro, login logout
router.get('/registro', (req, res) => {
  res.render('registro');
});

router.post('/registro', async (req, res) => {
  try {
    const { nombre, fecha_nac_r, correo_r, user_r, pass_r, pass_confirm_r } = req.body;
    
    if (pass_r !== pass_confirm_r) {
      return res.render('registro', { error: 'Las contraseñas no coinciden' });
    }
    
    const userExists = await User.findOne({ 
      $or: [{ email: correo_r }, { usuario: user_r }] 
    });
    
    if (userExists) {
      return res.render('registro', { error: 'El usuario o email ya existe' });
    }
    
    const user = new User({
      nombre,
      fechaNacimiento: fecha_nac_r,
      email: correo_r,
      usuario: user_r,
      password: pass_r
    });
    
    await user.save();
    
    const transaction = new Transaction({
      usuario: user._id,
      tipo: 'deposito',
      monto: 50000,
      descripcion: 'Saldo inicial'
    });
    await transaction.save();
    
    req.session.user = {
      id: user._id,
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      saldo: user.saldo
    };
    
    res.redirect('/perfil');
  } catch (error) {
    res.render('registro', { error: 'Error en el registro' });
  }
});

router.get('/iniciosesion', (req, res) => {
  res.render('login');
});

router.post('/iniciosesion', async (req, res) => {
  try {
    const { usuario_casino, clave_oculta } = req.body;
    
    const user = await User.findOne({ usuario: usuario_casino });
    if (!user || !(await user.comparePassword(clave_oculta))) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }
    
    req.session.user = {
      id: user._id,
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      saldo: user.saldo
    };
    
    res.redirect('/perfil');
  } catch (error) {
    res.render('login', { error: 'Error en el login' });
  }
});

router.get('/perfil', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/iniciosesion');
  }
  
  try {
    const transactions = await Transaction.find({ 
      usuario: req.session.user.id 
    }).sort({ fecha: -1 }).limit(5);
    
    const user = await User.findById(req.session.user.id);
    req.session.user.saldo = user.saldo; 
    
    res.render('perfil', { 
      user: req.session.user,
      transactions 
    });
  } catch (error) {
    res.redirect('/iniciosesion');
  }
});


router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
