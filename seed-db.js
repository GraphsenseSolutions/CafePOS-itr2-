// seed-db.js
const { MongoClient } = require('mongodb');
const { menuItems } = require('./data/menu-items.ts');

// Replace with your MongoDB URI
const uri = process.env.MONGODB_URI || 'mongodb+srv://main:main@cluster0.qfsbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('Created users collection');
    }
    
    if (!collectionNames.includes('orders')) {
      await db.createCollection('orders');
      console.log('Created orders collection');
    }
    
    if (!collectionNames.includes('menuitems')) {
      await db.createCollection('menuitems');
      console.log('Created menuitems collection');
      
      // Seed menu items
      const result = await db.collection('menuitems').insertMany(menuItems);
      console.log(`Added ${result.insertedCount} menu items to the database`);
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();