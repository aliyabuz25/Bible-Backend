const db = require('../database');

class Story {
  async getAll(filters = {}) {
    try {
      let query = "SELECT * FROM stories WHERE 1=1";
      const params = [];

      if (filters.categoryId) {
        query += " AND categoryId = ?";
        params.push(parseInt(filters.categoryId));
      }
      if (filters.type) {
        query += " AND type = ?";
        params.push(filters.type);
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
      const row = await db.get("SELECT * FROM stories WHERE id = ?", [parseInt(id)]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async findBySlug(slug) {
    try {
      const row = await db.get("SELECT * FROM stories WHERE slug = ?", [slug]);
      return row || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async search(queryText) {
    try {
      const sql = "SELECT * FROM stories WHERE title LIKE ? OR contentText LIKE ? OR type LIKE ?";
      const searchTerm = `%${queryText}%`;
      const rows = await db.all(sql, [searchTerm, searchTerm, searchTerm]);
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async create({ title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex }) {
    try {
      const createdAt = new Date().toISOString();
      const result = await db.run(
        "INSERT INTO stories (title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          slug,
          type,
          categoryId ? parseInt(categoryId) : null,
          duration,
          durationSeconds ? parseInt(durationSeconds) : 0,
          image,
          contentText,
          audioUrl,
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
        type,
        categoryId: categoryId ? parseInt(categoryId) : null,
        duration,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : 0,
        image,
        contentText,
        audioUrl,
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

  async update(id, { title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex }) {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;

      const updatedTitle = title !== undefined ? title : existing.title;
      const updatedSlug = slug !== undefined ? slug : existing.slug;
      const updatedType = type !== undefined ? type : existing.type;
      const updatedCategoryId = categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : existing.categoryId;
      const updatedDuration = duration !== undefined ? duration : existing.duration;
      const updatedDurationSeconds = durationSeconds !== undefined ? parseInt(durationSeconds) : existing.durationSeconds;
      const updatedImage = image !== undefined ? image : existing.image;
      const updatedContentText = contentText !== undefined ? contentText : existing.contentText;
      const updatedAudioUrl = audioUrl !== undefined ? audioUrl : existing.audioUrl;
      const updatedIsLocked = isLocked !== undefined ? (isLocked ? 1 : 0) : existing.isLocked;
      const updatedIsPublished = isPublished !== undefined ? (isPublished ? 1 : 0) : existing.isPublished;
      const updatedOrderIndex = orderIndex !== undefined ? parseInt(orderIndex) : existing.orderIndex;

      await db.run(
        "UPDATE stories SET title = ?, slug = ?, type = ?, categoryId = ?, duration = ?, durationSeconds = ?, image = ?, contentText = ?, audioUrl = ?, isLocked = ?, isPublished = ?, orderIndex = ? WHERE id = ?",
        [
          updatedTitle,
          updatedSlug,
          updatedType,
          updatedCategoryId,
          updatedDuration,
          updatedDurationSeconds,
          updatedImage,
          updatedContentText,
          updatedAudioUrl,
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
        type: updatedType,
        categoryId: updatedCategoryId,
        duration: updatedDuration,
        durationSeconds: updatedDurationSeconds,
        image: updatedImage,
        contentText: updatedContentText,
        audioUrl: updatedAudioUrl,
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
      const result = await db.run("DELETE FROM stories WHERE id = ?", [parseInt(id)]);
      return result.changes > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = new Story();
