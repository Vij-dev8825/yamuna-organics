const express = require('express');
const db = require('../data/db');

const router = express.Router();

// GET /api/products?category=&search=&sort=
router.get('/', async (req, res, next) => {
  try {
    let products = await db.list('products');
    const { category, search, sort } = req.query;

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') {
      products = [...products].sort((a, b) => a.sizes[0].price - b.sizes[0].price);
    } else if (sort === 'price-desc') {
      products = [...products].sort((a, b) => b.sizes[0].price - a.sizes[0].price);
    } else if (sort === 'rating') {
      products = [...products].sort((a, b) => b.rating - a.rating);
    }

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = (await db.list('categories')).sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({
      success: true,
      categories: categories.map((c) => ({ slug: c.id, label: c.label, image: c.image })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await db.get('products', req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
