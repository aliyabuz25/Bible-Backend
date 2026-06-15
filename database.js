const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper to run query with Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper to get all rows with Promise
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Helper to get single row with Promise
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Initialize tables and seed data
async function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Create tables
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phoneNumber TEXT NOT NULL,
            password TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            isVerified INTEGER DEFAULT 0,
            verificationToken TEXT,
            avatarId TEXT DEFAULT 'avatar_01',
            avatarUrl TEXT DEFAULT '',
            subscriptionStatus TEXT DEFAULT 'none',
            subscriptionPlan TEXT DEFAULT NULL,
            subscriptionExpiresAt TEXT DEFAULT NULL,
            trialStartedAt TEXT DEFAULT NULL,
            trialEndsAt TEXT DEFAULT NULL,
            revenueCatUserId TEXT DEFAULT NULL,
            fcmToken TEXT DEFAULT NULL
          )
        `);

        // Safely alter existing users table if columns are missing
        const alterColumns = [
          "isVerified INTEGER DEFAULT 0",
          "verificationToken TEXT",
          "avatarId TEXT DEFAULT 'avatar_01'",
          "avatarUrl TEXT DEFAULT ''",
          "subscriptionStatus TEXT DEFAULT 'none'",
          "subscriptionPlan TEXT DEFAULT NULL",
          "subscriptionExpiresAt TEXT DEFAULT NULL",
          "trialStartedAt TEXT DEFAULT NULL",
          "trialEndsAt TEXT DEFAULT NULL",
          "revenueCatUserId TEXT DEFAULT NULL",
          "fcmToken TEXT DEFAULT NULL"
        ];

        for (const col of alterColumns) {
          db.run(`ALTER TABLE users ADD COLUMN ${col}`, [], () => {});
        }

        db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            userEmail TEXT NOT NULL,
            productId TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            status TEXT NOT NULL,
            transactionId TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            sentTo TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            status TEXT DEFAULT NULL,
            metadata TEXT DEFAULT NULL
          )
        `);

        // Safely alter existing notifications table
        const alterNotificationColumns = [
          "read INTEGER DEFAULT 0",
          "status TEXT DEFAULT NULL",
          "metadata TEXT DEFAULT NULL"
        ];
        for (const col of alterNotificationColumns) {
          db.run(`ALTER TABLE notifications ADD COLUMN ${col}`, [], () => {});
        }

        db.run(`
          CREATE TABLE IF NOT EXISTS catalogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            thumbnailVertical TEXT NOT NULL,
            thumbnailHorizontal TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        // NEW TABLES FOR BIBLE BACKEND REQUIREMENTS
        db.run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            count INTEGER DEFAULT 0,
            image TEXT NOT NULL,
            type TEXT NOT NULL,
            orderIndex INTEGER DEFAULT 0,
            isPublished INTEGER DEFAULT 1,
            createdAt TEXT NOT NULL
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            categoryId INTEGER,
            duration TEXT,
            durationSeconds INTEGER,
            image TEXT NOT NULL,
            contentText TEXT,
            audioUrl TEXT,
            isLocked INTEGER DEFAULT 0,
            isPublished INTEGER DEFAULT 0,
            orderIndex INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (categoryId) REFERENCES categories(id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS audio_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            categoryId INTEGER,
            duration TEXT,
            durationSeconds INTEGER,
            image TEXT NOT NULL,
            audioUrl TEXT NOT NULL,
            badgeColor TEXT DEFAULT 'purple',
            isLocked INTEGER DEFAULT 0,
            isPublished INTEGER DEFAULT 0,
            orderIndex INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (categoryId) REFERENCES categories(id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS music_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            image TEXT NOT NULL,
            audioUrl TEXT,
            createdAt TEXT NOT NULL
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            catColor TEXT NOT NULL,
            image TEXT NOT NULL,
            stories TEXT,
            ages TEXT,
            pages TEXT,
            price TEXT,
            externalUrl TEXT,
            isAvailable INTEGER DEFAULT 1,
            orderIndex INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            contentId INTEGER NOT NULL,
            contentType TEXT NOT NULL,
            addedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS playback_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            contentId INTEGER NOT NULL,
            contentType TEXT NOT NULL,
            progressSeconds INTEGER NOT NULL,
            totalSeconds INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            lastPlayedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Check if users exist to seed
        db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
          if (err) return reject(err);
          if (row.count === 0) {
            console.log('--- SEEDING SQLITE DATABASE ---');
            
            // Seed Users
            const adminHash = await bcrypt.hash('admin123', 10);
            const user2Hash = await bcrypt.hash('veli123', 10);
            const user3Hash = await bcrypt.hash('ayse123', 10);
            const user4Hash = await bcrypt.hash('ahmet123', 10);

            db.run("INSERT INTO users (firstName, lastName, email, phoneNumber, password, createdAt, isVerified, avatarId, subscriptionStatus) VALUES (?, ?, ?, ?, ?, ?, 1, 'avatar_05', 'active')",
              ['Admin', 'User', 'admin@biblecms.com', '5550000000', adminHash, new Date().toISOString()]);

            db.run("INSERT INTO users (firstName, lastName, email, phoneNumber, password, createdAt, isVerified, avatarId, subscriptionStatus) VALUES (?, ?, ?, ?, ?, ?, 1, 'avatar_01', 'active')",
              ['Veli', 'Kaya', 'veli@example.com', '5552345678', user2Hash, new Date().toISOString()]);

            db.run("INSERT INTO users (firstName, lastName, email, phoneNumber, password, createdAt, isVerified, avatarId, subscriptionStatus) VALUES (?, ?, ?, ?, ?, ?, 1, 'avatar_02', 'none')",
              ['Ayşe', 'Demir', 'ayse@example.com', '5553456789', user3Hash, new Date().toISOString()]);

            db.run("INSERT INTO users (firstName, lastName, email, phoneNumber, password, createdAt, isVerified, avatarId, subscriptionStatus) VALUES (?, ?, ?, ?, ?, ?, 1, 'avatar_03', 'none')",
              ['Ahmet', 'Yılmaz', 'ahmet.yilmaz@example.com', '5554567890', user4Hash, new Date().toISOString()]);

            // Seed Payments
            db.run("INSERT INTO payments (userId, userEmail, productId, amount, currency, status, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [2, 'veli@example.com', 'premium_access_yearly', 49.99, 'USD', 'completed', 'GPA.3312-9842-1209-12345', new Date().toISOString()]);

            db.run("INSERT INTO payments (userId, userEmail, productId, amount, currency, status, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [2, 'veli@example.com', 'ad_free_monthly', 2.99, 'USD', 'completed', 'GPA.3381-1294-0982-84729', new Date().toISOString()]);

            db.run("INSERT INTO payments (userId, userEmail, productId, amount, currency, status, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [3, 'ayse@example.com', 'premium_access_yearly', 49.99, 'USD', 'completed', 'GPA.9942-1284-8263-12847', new Date().toISOString()]);

            // Seed Notifications
            db.run("INSERT INTO notifications (title, message, type, sentTo, createdAt, read, status) VALUES (?, ?, ?, ?, ?, 0, 'pending')",
              ['Welcome to BibleCMS', 'Thank you for downloading and registering in the app.', 'success', 'all', new Date().toISOString()]);

            db.run("INSERT INTO notifications (title, message, type, sentTo, createdAt, read, status) VALUES (?, ?, ?, ?, ?, 0, 'pending')",
              ['Premium Catalog Unlocked', 'Your yearly subscription has successfully activated.', 'info', 'veli@example.com', new Date().toISOString()]);

            // Seed Catalogs
            db.run("INSERT INTO catalogs (name, description, thumbnailVertical, thumbnailHorizontal, createdAt) VALUES (?, ?, ?, ?, ?)",
              ['Visual Bible Catalog v1', 'Holy Bible visual catalog containing illustrations and text guides.', 'https://cdn.biblecms.com/images/bible_vertical.jpg', 'https://cdn.biblecms.com/images/bible_horizontal.jpg', new Date().toISOString()]);

            db.run("INSERT INTO catalogs (name, description, thumbnailVertical, thumbnailHorizontal, createdAt) VALUES (?, ?, ?, ?, ?)",
              ['Sample Visual Publication', 'A pre-loaded sample publication showcasing local vertical and horizontal covers.', '/uploads/sample_vertical.jpg', '/uploads/sample_horizontal.jpg', new Date().toISOString()]);
            
            // Seed Categories
            db.run("INSERT INTO categories (title, subtitle, count, image, type, orderIndex, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
              ['Old Testament', '39 books', 39, 'https://cdn.kidsbiblestories.com/categories/cat-old-testament.jpg', 'story', 1, new Date().toISOString()]);
            db.run("INSERT INTO categories (title, subtitle, count, image, type, orderIndex, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
              ['New Testament', '27 books', 27, 'https://cdn.kidsbiblestories.com/categories/cat-new-testament.jpg', 'story', 2, new Date().toISOString()]);
            db.run("INSERT INTO categories (title, subtitle, count, image, type, orderIndex, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
              ['Old Audio Testament', '32 stories', 32, 'https://cdn.kidsbiblestories.com/categories/cat-old-audio.jpg', 'audio', 3, new Date().toISOString()]);
            db.run("INSERT INTO categories (title, subtitle, count, image, type, orderIndex, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
              ['Bedtime Stories', '53 stories', 53, 'https://cdn.kidsbiblestories.com/categories/cat-bedtime.jpg', 'story', 4, new Date().toISOString()]);

            // Seed Stories
            db.run("INSERT INTO stories (title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['Isaiah', 'isaiah', 'Old Testament', 1, '12 min', 720, 'https://cdn.kidsbiblestories.com/stories/covers/ot-isaiah.jpg', 'This is the story of Isaiah...', 'https://cdn.kidsbiblestories.com/audio/stories/ot-isaiah.mp3', 0, 1, 1, new Date().toISOString()]);
            db.run("INSERT INTO stories (title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['Genesis Creation', 'genesis-creation', 'Old Testament', 1, '15 min', 900, 'https://cdn.kidsbiblestories.com/stories/covers/ot-genesis.jpg', 'In the beginning...', 'https://cdn.kidsbiblestories.com/audio/stories/ot-genesis.mp3', 0, 1, 2, new Date().toISOString()]);
            db.run("INSERT INTO stories (title, slug, type, categoryId, duration, durationSeconds, image, contentText, audioUrl, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['Noah Ark', 'noah-ark', 'Old Testament', 1, '10 min', 600, 'https://cdn.kidsbiblestories.com/stories/covers/ot-noah.jpg', 'Build an ark...', 'https://cdn.kidsbiblestories.com/audio/stories/ot-noah.mp3', 1, 1, 3, new Date().toISOString()]);

            // Seed Audio Items
            db.run("INSERT INTO audio_items (title, slug, category, categoryId, duration, durationSeconds, image, audioUrl, badgeColor, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['2 Chronicles', '2-chronicles', 'Old Audio Testament', 3, '10 min', 600, 'https://cdn.kidsbiblestories.com/audio/covers/ot-2chronicles.jpg', 'https://cdn.kidsbiblestories.com/audio/files/ot-2chronicles.mp3', 'purple', 0, 1, 1, new Date().toISOString()]);
            db.run("INSERT INTO audio_items (title, slug, category, categoryId, duration, durationSeconds, image, audioUrl, badgeColor, isLocked, isPublished, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['David and Goliath', 'david-goliath-audio', 'Old Audio Testament', 3, '8 min', 480, 'https://cdn.kidsbiblestories.com/audio/covers/ot-david.jpg', 'https://cdn.kidsbiblestories.com/audio/files/ot-david.mp3', 'orange', 1, 1, 2, new Date().toISOString()]);

            // Seed Music Items
            db.run("INSERT INTO music_items (title, type, image, audioUrl, createdAt) VALUES (?, ?, ?, ?, ?)",
              ['Hebrew Lullaby', 'Hebrew Biblical Music', 'https://cdn.kidsbiblestories.com/music/covers/hebrew-lullaby.jpg', 'https://cdn.kidsbiblestories.com/music/files/hebrew-lullaby.mp3', new Date().toISOString()]);
            db.run("INSERT INTO music_items (title, type, image, audioUrl, createdAt) VALUES (?, ?, ?, ?, ?)",
              ['Joyful Praise', 'Christian Music', 'https://cdn.kidsbiblestories.com/music/covers/joyful-praise.jpg', 'https://cdn.kidsbiblestories.com/music/files/joyful-praise.mp3', new Date().toISOString()]);

            // Seed Products
            db.run("INSERT INTO products (title, category, catColor, image, stories, ages, pages, price, externalUrl, isAvailable, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['Kids Bible Stories Book', 'Old Testament', '#9747ff', 'https://cdn.kidsbiblestories.com/products/ot-book.jpg', '25+', '3-12', '150', '$12.99', 'https://amazon.com/example-bible-book', 1, 1, new Date().toISOString()]);
            db.run("INSERT INTO products (title, category, catColor, image, stories, ages, pages, price, externalUrl, isAvailable, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              ['New Testament Stories Book', 'New Testament', '#28a745', 'https://cdn.kidsbiblestories.com/products/nt-book.jpg', '20+', '3-12', '120', '$10.99', 'https://amazon.com/example-nt-book', 1, 2, new Date().toISOString()]);

            console.log('--- SQLITE DATABASE SEED COMPLETE ---');
          }
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  db,
  run,
  all,
  get,
  initDb
};
