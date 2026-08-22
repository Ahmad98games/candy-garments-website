const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Hardcoded Production URI (The working one)
const MONGO_URI = 'mongodb+srv://ahmad_omnora:98158302384@cluster0.mnp2buu.mongodb.net/?appName=Cluster0';

// Define Product Schema (Simplified Match)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: Number,
    category: { type: String, required: true },
    images: [String],
    inStock: { type: Boolean, default: true },
    features: [String],
    scentProfile: {
        topNotes: [String],
        heartNotes: [String],
        baseNotes: [String]
    },
    ingredients: [String],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const seedProducts = async () => {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Reading local products.json...');
        const dataPath = path.join(__dirname, '../data/products.json');
        const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        console.log(`Found ${products.length} products.`);

        console.log('Clearing existing products...');
        await Product.deleteMany({}); // Optional: clear before seed to avoid dupes

        console.log('Inserting products...');
        // Remove _id to let Mongo generate valid ObjectIds
        const productsToInsert = products.map(({ _id, ...rest }) => rest);
        await Product.insertMany(productsToInsert);

        console.log(`Successfully seeded ${products.length} products!`);
        process.exit(0);
    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
};

seedProducts();
