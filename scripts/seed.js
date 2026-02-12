// Seed script to populate initial food items
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const FoodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  isAvailable: Boolean
}, {
  timestamps: true
});

const Food = mongoose.models.Food || mongoose.model('Food', FoodSchema);

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
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Food.deleteMany({});
    console.log('🗑️  Cleared existing food items');
    
    // Insert seed data
    await Food.insertMany(seedFoods);
    console.log('✅ Seed data inserted successfully!');
    
    const foods = await Food.find({});
    console.log('\n📋 Current food items:');
    foods.forEach(food => {
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
