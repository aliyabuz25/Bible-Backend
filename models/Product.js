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
          category || 'Default Category',
          catColor || '#9747ff',
          image,
          stories || '',
          ages || '',
          pages || '',
          price,
          externalUrl || '',
          isAvailable ? 1 : 0,
          orderIndex ? parseInt(orderIndex) : 0,
          createdAt
        ]
      );
      return {
        id: result.lastID,
        title,
        category: category || 'Default Category',
        catColor: catColor || '#9747ff',
        image,
        stories: stories || '',
        ages: ages || '',
        pages: pages || '',
        price,
        externalUrl: externalUrl || '',
        isAvailable: isAvailable ? 1 : 0,
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
        createdAt
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(id, updates) {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;

      const merged = { ...existing, ...updates };
      await db.run(
        "UPDATE products SET title = ?, category = ?, catColor = ?, image = ?, stories = ?, ages = ?, pages = ?, price = ?, externalUrl = ?, isAvailable = ?, orderIndex = ? WHERE id = ?",
        [
          merged.title,
          merged.category,
          merged.catColor,
          merged.image,
          merged.stories,
          merged.ages,
          merged.pages,
          merged.price,
          merged.externalUrl,
          merged.isAvailable ? 1 : 0,
          merged.orderIndex ? parseInt(merged.orderIndex) : 0,
          parseInt(id)
        ]
      );
      return await this.findById(id);
    } catch (err) {
      console.error(err);
      return null;
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
