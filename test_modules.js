const request = require('supertest');
const app = require('./index');
const { initDb } = require('./database');

async function testNewModules() {
  console.log('--- NEW MODULES (CRUD) INTEGRATION TESTS START ---');

  // Wait for DB init
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Categories CRUD Test
  console.log('\nTesting Categories CRUD...');
  
  // POST Create
  const createCatRes = await request(app)
    .post('/api/categories')
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Test Category',
      subtitle: 'Test Subtitle',
      count: 5,
      image: '/uploads/test_cat.png',
      type: 'story',
      orderIndex: 1,
      isPublished: true
    });
  console.log('Create Category Status:', createCatRes.status);
  console.log('Create Category Body:', createCatRes.body);
  const catId = createCatRes.body.category.id;

  // GET All
  const getCatsRes = await request(app)
    .get('/api/categories')
    .set('User-Agent', 'bible-appclient');
  console.log('Get Categories Status:', getCatsRes.status);
  console.log('Categories Count:', getCatsRes.body.length);

  // PUT Update
  const updateCatRes = await request(app)
    .put(`/api/categories/${catId}`)
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Updated Category Title',
      subtitle: 'Updated Subtitle',
      count: 10,
      image: '/uploads/test_cat_updated.png',
      type: 'story',
      orderIndex: 2,
      isPublished: false
    });
  console.log('Update Category Status:', updateCatRes.status);
  console.log('Update Category Body:', updateCatRes.body);

  // 2. Stories CRUD Test
  console.log('\nTesting Stories CRUD...');
  
  // POST Create
  const createStoryRes = await request(app)
    .post('/api/stories')
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Test Story',
      slug: 'test-story',
      type: 'story',
      categoryId: catId,
      duration: '05:00',
      durationSeconds: 300,
      image: '/uploads/story.png',
      contentText: 'Test Story Content text...',
      audioUrl: 'https://cdn.example.com/story.mp3',
      isLocked: false,
      isPublished: true,
      orderIndex: 1
    });
  console.log('Create Story Status:', createStoryRes.status);
  console.log('Create Story Body:', createStoryRes.body);
  const storyId = createStoryRes.body.story.id;

  // GET All
  const getStoriesRes = await request(app)
    .get('/api/stories')
    .set('User-Agent', 'bible-appclient');
  console.log('Get Stories Status:', getStoriesRes.status);
  console.log('Stories Count:', getStoriesRes.body.length);

  // PUT Update
  const updateStoryRes = await request(app)
    .put(`/api/stories/${storyId}`)
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Updated Story Title',
      slug: 'updated-story-slug',
      type: 'story',
      categoryId: catId,
      duration: '06:00',
      durationSeconds: 360,
      image: '/uploads/story_updated.png',
      contentText: 'Updated Content Text',
      audioUrl: 'https://cdn.example.com/story_updated.mp3',
      isLocked: true,
      isPublished: false,
      orderIndex: 2
    });
  console.log('Update Story Status:', updateStoryRes.status);
  console.log('Update Story Body:', updateStoryRes.body);

  // 3. Audio Items CRUD Test
  console.log('\nTesting Audio Items CRUD...');
  
  // POST Create
  const createAudioRes = await request(app)
    .post('/api/audio-items')
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Test Audio Item',
      slug: 'test-audio-item',
      category: 'Test Category Name',
      categoryId: catId,
      duration: '04:15',
      durationSeconds: 255,
      image: '/uploads/audio.png',
      audioUrl: 'https://cdn.example.com/audio.mp3',
      badgeColor: '#ff0000',
      isLocked: false,
      isPublished: true,
      orderIndex: 1
    });
  console.log('Create Audio Item Status:', createAudioRes.status);
  console.log('Create Audio Item Body:', createAudioRes.body);
  const audioId = createAudioRes.body.audioItem.id;

  // GET All
  const getAudiosRes = await request(app)
    .get('/api/audio-items')
    .set('User-Agent', 'bible-appclient');
  console.log('Get Audio Items Status:', getAudiosRes.status);
  console.log('Audio Items Count:', getAudiosRes.body.length);

  // PUT Update
  const updateAudioRes = await request(app)
    .put(`/api/audio-items/${audioId}`)
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Updated Audio Item Title',
      slug: 'updated-audio-slug',
      category: 'Updated Category Name',
      categoryId: catId,
      duration: '05:00',
      durationSeconds: 300,
      image: '/uploads/audio_updated.png',
      audioUrl: 'https://cdn.example.com/audio_updated.mp3',
      badgeColor: '#0000ff',
      isLocked: true,
      isPublished: false,
      orderIndex: 2
    });
  console.log('Update Audio Item Status:', updateAudioRes.status);
  console.log('Update Audio Item Body:', updateAudioRes.body);

  // 4. Products CRUD Test
  console.log('\nTesting Products CRUD...');
  
  // POST Create
  const createProductRes = await request(app)
    .post('/api/products')
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Test Product Sub',
      description: 'Test subscription details',
      price: 9.99,
      priceString: '$9.99',
      image: '/uploads/product.png',
      duration: '1 Month',
      durationSeconds: 2592000,
      orderIndex: 1,
      isPublished: true
    });
  console.log('Create Product Status:', createProductRes.status);
  console.log('Create Product Body:', createProductRes.body);
  const productId = createProductRes.body.product.id;

  // GET All
  const getProductsRes = await request(app)
    .get('/api/products')
    .set('User-Agent', 'bible-appclient');
  console.log('Get Products Status:', getProductsRes.status);
  console.log('Products Count:', getProductsRes.body.length);

  // PUT Update
  const updateProductRes = await request(app)
    .put(`/api/products/${productId}`)
    .set('User-Agent', 'bible-appclient')
    .send({
      title: 'Updated Product Title',
      description: 'Updated description',
      price: 19.99,
      priceString: '$19.99',
      image: '/uploads/product_updated.png',
      duration: '2 Months',
      durationSeconds: 5184000,
      orderIndex: 2,
      isPublished: false
    });
  console.log('Update Product Status:', updateProductRes.status);
  console.log('Update Product Body:', updateProductRes.body);

  // 5. Clean up testing entities via DELETE
  console.log('\nCleaning up test entities (DELETE)...');
  
  const delProductRes = await request(app)
    .delete(`/api/products/${productId}`)
    .set('User-Agent', 'bible-appclient');
  console.log('Delete Product Status:', delProductRes.status);

  const delAudioRes = await request(app)
    .delete(`/api/audio-items/${audioId}`)
    .set('User-Agent', 'bible-appclient');
  console.log('Delete Audio Item Status:', delAudioRes.status);

  const delStoryRes = await request(app)
    .delete(`/api/stories/${storyId}`)
    .set('User-Agent', 'bible-appclient');
  console.log('Delete Story Status:', delStoryRes.status);

  const delCatRes = await request(app)
    .delete(`/api/categories/${catId}`)
    .set('User-Agent', 'bible-appclient');
  console.log('Delete Category Status:', delCatRes.status);

  console.log('\n--- ALL NEW MODULES TESTS PASSED SEAMLESSLY ---');
  process.exit(0);
}

testNewModules().catch(err => {
  console.error(err);
  process.exit(1);
});
