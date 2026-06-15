const db = require('../database');

class Product {
  async getAll() {
    try {
      const rows = await db.all("SELECT * FROM products ORDER BY orderIndex ASC");
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async findById(id) {
    try {
      const row = await db.get("SELECT * FROM products WHERE id = ?", [parseInt(id)]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async create({ title, category, catColor, image, stories, ages, pages, price, externalUrl, isAvailable, orderIndex }) {
    try {
      const createdAt = new Date().toISOString();
      const result = await db.run(
        "INSERT INTO products (title, category, catColor, image, stories, ages, pages, price, externalUrl, isAvailable, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          category,
          catColor || '#9747ff',
          image,
          stories,
          ages,
          pages,
          price,
          externalUrl,
          isAvailable ? 1 : 0,
          orderIndex ? parseInt(orderIndex) : 0,
          createdAt
        ]
      );
      return {
        id: result.lastID,
        title,
        category,
        catColor: catColor || '#9747ff',
        image,
        stories,
        ages,
        pages,
        price,
        externalUrl,
        isAvailable: isAvailable ? 1 : 0,
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
        createdAt
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const result = await db.run("DELETE FROM products WHERE id = ?", [parseInt(id)]);
      return result.changes > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = new Product();
