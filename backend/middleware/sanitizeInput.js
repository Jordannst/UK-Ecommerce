import sanitizeHtml from 'sanitize-html';

/**
 * Middleware untuk sanitasi input HTML
 * Menghapus semua tag HTML dan script dari input user
 */
export const sanitizeInput = (req, res, next) => {
  // Fields yang perlu disanitasi
  const fieldsToSanitize = ['name', 'phone', 'address'];

  if (req.body) {
    fieldsToSanitize.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Sanitasi: hapus semua HTML tags, hanya ambil text content
        req.body[field] = sanitizeHtml(req.body[field], {
          allowedTags: [], // Tidak ada tag yang diizinkan
          allowedAttributes: {}, // Tidak ada attribute yang diizinkan
          textContent: true // Hanya ambil text content
        }).trim();
      }
    });
  }

  next();
};

