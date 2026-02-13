// Seed script to populate initial food items with Firebase
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const seedFoods = [
  {
    name: 'Chicken Pakoda',
    price: 50,
    image: '/img1.jpg',
    isAvailable: true,
  },
  {
    name: 'Paneer Pakoda',
    price: 50,
    image: '/img2.jpg',
    isAvailable: true
  },
];

async function seed() {
  try {
    console.log('🌱 Initializing Firebase...');
    
    // Initialize Firebase Admin SDK
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    
    const db = getFirestore();
    console.log('✅ Connected to Firebase');
    
    // Clear existing data
    const foodsSnapshot = await db.collection('foods').get();
    const batch = db.batch();
    foodsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('🗑️  Cleared existing food items');
    
    // Insert seed data
    const insertBatch = db.batch();
    const timestamp = new Date().toISOString();
    
    seedFoods.forEach(food => {
      const docRef = db.collection('foods').doc();
      insertBatch.set(docRef, {
        ...food,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    });
    
    await insertBatch.commit();
    console.log('✅ Seed data inserted successfully!');
    
    // Display inserted foods
    const foods = await db.collection('foods').get();
    console.log('\n📋 Current food items:');
    foods.docs.forEach(doc => {
      const food = doc.data();
      console.log(`   - ${food.name}: ₹${food.price}`);
    });
    
    console.log('\n✨ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
