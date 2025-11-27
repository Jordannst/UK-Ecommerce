import validator from 'validator';

/**
 * Middleware untuk validasi input
 * Validasi email, password, dan name
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Validasi name
  if (!name || typeof name !== 'string') {
    errors.push('Nama wajib diisi');
  } else if (name.trim().length === 0) {
    errors.push('Nama tidak boleh hanya spasi');
  } else if (name.trim().length < 2) {
    errors.push('Nama minimal 2 karakter');
  }

  // Validasi email
  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  } else if (!validator.isEmail(email)) {
    errors.push('Format email tidak valid');
  }

  // Validasi password
  if (!password || typeof password !== 'string') {
    errors.push('Password wajib diisi');
  } else if (password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors
    });
  }

  next();
};

/**
 * Middleware untuk validasi login
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validasi email
  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  } else if (!validator.isEmail(email)) {
    errors.push('Format email tidak valid');
  }

  // Validasi password
  if (!password || typeof password !== 'string') {
    errors.push('Password wajib diisi');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors
    });
  }

  next();
};

/**
 * Middleware untuk validasi update profile
 */
export const validateUpdateProfile = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  // Validasi name jika ada
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Nama harus berupa string');
    } else if (name.trim().length === 0) {
      errors.push('Nama tidak boleh hanya spasi');
    } else if (name.trim().length < 2) {
      errors.push('Nama minimal 2 karakter');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors
    });
  }

  next();
};

