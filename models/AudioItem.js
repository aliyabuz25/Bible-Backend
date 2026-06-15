const db = require('../database');

class AudioItem {
  async getAll(filters = {}) {
    try {
      let query = "SELECT * FROM audio_items WHERE 1=1";
      const params = [];

      if (filters.categoryId) {
        query += " AND categoryId = ?";
        params.push(parseInt(filters.categoryId));
      }
      if (filters.category) {
        query += " AND category = ?";
        params.push(filters.category);
      }
      if (filters.isPublished !== undefined) {
        query += " AND isPublished = ?";
        params.push(filters.isPublished ? 1 : 0);
      }

      query += " ORDER BY orderIndex ASC, id ASC";
      const rows = await db.all(query, params);
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async findById(id) {
    try {
      const row = await db.get("SELECT * FROM audio_items WHERE id = ?", [parseInt(id)]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async findBySlug(slug) {
    try {
      const row = await db.get("SELECT * FROM audio_items WHERE slug = ?", [slug]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async search(queryText) {
    try {
      const sql = "SELECT * FROM audio_items WHERE title LIKE ? OR category LIKE ?";
      const searchTerm = `%${queryText}%`;
      const rows = await db.all(sql, [searchTerm, searchTerm]);
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async create({ title, slug, category, categoryId, duration, durationSeconds, image, audioUrl, badgeColor, isLocked, isPublished, orderIndex }) {
    try {
      const createdAt = new Date().toISOString();
      const result = await db.run(
        "INSERT INTO audio_items (title, slug, category, categoryId, duration, durationSeconds, image, audioUrl, badgeColor, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          slug,
          category,
          categoryId ? parseInt(categoryId) : null,
          duration,
          durationSeconds ? parseInt(durationSeconds) : 0,
          image,
          audioUrl,
          badgeColor || 'purple',
          isLocked ? 1 : 0,
          isPublished ? 1 : 0,
          orderIndex ? parseInt(orderIndex) : 0,
          createdAt
        ]
      );
      return {
        id: result.lastID,
        title,
        slug,
        category,
        categoryId: categoryId ? parseInt(categoryId) : null,
        duration,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : 0,
        image,
        audioUrl,
        badgeColor: badgeColor || 'purple',
        isLocked: isLocked ? 1 : 0,
        isPublished: isPublished ? 1 : 0,
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
        createdAt
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(id, { title, slug, category, categoryId, duration, durationSeconds, image, audioUrl, badgeColor, isLocked, isPublished, orderIndex }) {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;

      const updatedTitle = title !== undefined ? title : existing.title;
      const updatedSlug = slug !== undefined ? slug : existing.slug;
      const updatedCategory = category !== undefined ? category : existing.category;
      const updatedCategoryId = categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : existing.categoryId;
      const updatedDuration = duration !== undefined ? duration : existing.duration;
      const updatedDurationSeconds = durationSeconds !== undefined ? parseInt(durationSeconds) : existing.durationSeconds;
      const updatedImage = image !== undefined ? image : existing.image;
      const updatedAudioUrl = audioUrl !== undefined ? audioUrl : existing.audioUrl;
      const updatedBadgeColor = badgeColor !== undefined ? badgeColor : existing.badgeColor;
      const updatedIsLocked = isLocked !== undefined ? (isLocked ? 1 : 0) : existing.isLocked;
      const updatedIsPublished = isPublished !== undefined ? (isPublished ? 1 : 0) : existing.isPublished;
      const updatedOrderIndex = orderIndex !== undefined ? parseInt(orderIndex) : existing.orderIndex;

      await db.run(
        "UPDATE audio_items SET title = ?, slug = ?, category = ?, categoryId = ?, duration = ?, durationSeconds = ?, image = ?, audioUrl = ?, badgeColor = ?, isLocked = ?, isPublished = ?, orderIndex = ? WHERE id = ?",
        [
          updatedTitle,
          updatedSlug,
          updatedCategory,
          updatedCategoryId,
          updatedDuration,
          updatedDurationSeconds,
          updatedImage,
          updatedAudioUrl,
          updatedBadgeColor,
          updatedIsLocked,
          updatedIsPublished,
          updatedOrderIndex,
          parseInt(id)
        ]
      );

      return {
        id: parseInt(id),
        title: updatedTitle,
        slug: updatedSlug,
        category: updatedCategory,
        categoryId: updatedCategoryId,
        duration: updatedDuration,
        durationSeconds: updatedDurationSeconds,
        image: updatedImage,
        audioUrl: updatedAudioUrl,
        badgeColor: updatedBadgeColor,
        isLocked: updatedIsLocked,
        isPublished: updatedIsPublished,
        orderIndex: updatedOrderIndex
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const result = await db.run("DELETE FROM audio_items WHERE id = ?", [parseInt(id)]);
      return result.changes > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = new AudioItem();
