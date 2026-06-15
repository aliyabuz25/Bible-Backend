const db = require('../database');

class Category {
  async getAll() {
    try {
      const rows = await db.all("SELECT * FROM categories ORDER BY orderIndex ASC");
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async findById(id) {
    try {
      const row = await db.get("SELECT * FROM categories WHERE id = ?", [parseInt(id)]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async create({ title, subtitle, count, image, type, orderIndex, isPublished }) {
    try {
      const createdAt = new Date().toISOString();
      const result = await db.run(
        "INSERT INTO categories (title, subtitle, count, image, type, orderIndex, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [title, subtitle, parseInt(count) || 0, image, type, parseInt(orderIndex) || 0, isPublished ? 1 : 0, createdAt]
      );
      return {
        id: result.lastID,
        title,
        subtitle,
        count: parseInt(count) || 0,
        image,
        type,
        orderIndex: parseInt(orderIndex) || 0,
        isPublished: isPublished ? 1 : 0,
        createdAt
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(id, { title, subtitle, count, image, type, orderIndex, isPublished }) {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;

      const updatedTitle = title !== undefined ? title : existing.title;
      const updatedSubtitle = subtitle !== undefined ? subtitle : existing.subtitle;
      const updatedCount = count !== undefined ? parseInt(count) : existing.count;
      const updatedImage = image !== undefined ? image : existing.image;
      const updatedType = type !== undefined ? type : existing.type;
      const updatedOrderIndex = orderIndex !== undefined ? parseInt(orderIndex) : existing.orderIndex;
      const updatedIsPublished = isPublished !== undefined ? (isPublished ? 1 : 0) : existing.isPublished;

      await db.run(
        "UPDATE categories SET title = ?, subtitle = ?, count = ?, image = ?, type = ?, orderIndex = ?, isPublished = ? WHERE id = ?",
        [updatedTitle, updatedSubtitle, updatedCount, updatedImage, updatedType, updatedOrderIndex, updatedIsPublished, parseInt(id)]
      );

      return {
        id: parseInt(id),
        title: updatedTitle,
        subtitle: updatedSubtitle,
        count: updatedCount,
        image: updatedImage,
        type: updatedType,
        orderIndex: updatedOrderIndex,
        isPublished: updatedIsPublished
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const result = await db.run("DELETE FROM categories WHERE id = ?", [parseInt(id)]);
      return result.changes > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = new Category();
