const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

// Product Schema (matching the backend model)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '/images/bath bomb.png' },
    category: { type: String, default: 'bath-bombs' },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    details: { type: String },
    ingredients: [{ type: String }],
    size: { type: String },
    skinType: { type: String },
    inventoryCount: { type: Number, default: 100 },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Product data from legacy website (data.js)
const products = [
    {
        name: 'Calm Lavender Bath Bomb',
        description: 'Soothing lavender with chamomile for a restful soak',
        price: 899,
        image: '/images/main/calm lavender.png',
        category: 'bath-bombs',
        isFeatured: true,
        isNew: true,
        details: 'A gentle, skin-kind bath bomb infused with natural lavender essential oil, chamomile extract, and shea butter. pH-balanced and suitable for sensitive skin.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Lavender Oil', 'Chamomile Extract', 'Shea Butter'],
        size: '180g',
        skinType: 'All skin types',
        inventoryCount: 100
    },
    {
        name: 'Breathe Eucalyptus Bath Bomb',
        description: 'Eucalyptus and peppermint for clarity and refresh',
        price: 949,
        image: '/images/main/breath bath.png',
        category: 'bath-bombs',
        isFeatured: true,
        isNew: true,
        details: 'Refreshing blend with eucalyptus and peppermint essential oils to awaken the senses. Enriched with cocoa butter to leave skin soft.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Eucalyptus Oil', 'Peppermint Oil', 'Cocoa Butter'],
        size: '180g',
        skinType: 'Normal to oily',
        inventoryCount: 100
    },
    {
        name: 'Glow Citrus Bath Bomb',
        description: 'Bright citrus with vitamin E for a mood lift',
        price: 899,
        image: '/images/main/Glow Citrus Bath Bomb.png',
        category: 'bath-bombs',
        isFeatured: true,
        isNew: false,
        details: 'Uplifting notes of orange and lemon with vitamin E and sweet almond oil to nourish and soften skin.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Orange Oil', 'Lemon Oil', 'Vitamin E', 'Almond Oil'],
        size: '180g',
        skinType: 'All skin types',
        inventoryCount: 100
    },
    {
        name: 'Rose Comfort Bath Bomb',
        description: 'Soft rose and vanilla for gentle comfort',
        price: 999,
        image: '/images/main/rose.png',
        category: 'bath-bombs',
        isFeatured: false,
        isNew: false,
        details: 'Calming blend of rose and vanilla with kaolin clay to soothe and oat kernel flour to calm the skin barrier.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Rose Oil', 'Vanilla', 'Kaolin Clay', 'Colloidal Oat'],
        size: '180g',
        skinType: 'Dry & sensitive',
        inventoryCount: 100
    },
    {
        name: 'Balance Green Tea Bath Bomb',
        description: 'Green tea antioxidants for balanced skin',
        price: 949,
        image: '/images/main/green tea.png',
        category: 'bath-bombs',
        isFeatured: false,
        isNew: false,
        details: 'Green tea extract and jojoba oil help support a healthy skin barrier while offering a serene soak.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Green Tea Extract', 'Jojoba Oil'],
        size: '180g',
        skinType: 'Combination',
        inventoryCount: 100
    },
    {
        name: 'Unwind Chamomile Bath Bomb',
        description: 'Chamomile and calendula for calming downtime',
        price: 899,
        image: '/images/main/unvind.png',
        category: 'bath-bombs',
        isFeatured: false,
        isNew: false,
        details: 'Chamomile and calendula extracts help soothe while coconut oil leaves skin soft and comfortable.',
        ingredients: ['Sodium Bicarbonate', 'Citric Acid', 'Chamomile Extract', 'Calendula Extract', 'Coconut Oil'],
        size: '180g',
        skinType: 'Sensitive',
        inventoryCount: 100
    }
];

async function connectDB() {
    const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/omnora_ecommerce';
    try {
        await mongoose.connect(primaryUri);
        console.log('MongoDB connected (primary)');
        return;
    } catch (primaryErr) {
        console.log('Primary MongoDB connection failed:', primaryErr.message);
    }

    // Try local MongoDB fallback
    const localUri = 'mongodb://127.0.0.1:27017/omnora_ecommerce';
    try {
        await mongoose.connect(localUri);
        console.log('MongoDB connected (local fallback)');
        return;
    } catch (localErr) {
        console.log('Local MongoDB fallback failed:', localErr.message);
    }

    // Final fallback: in-memory MongoDB
    try {
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log('MongoDB connected (in-memory)');
    } catch (memErr) {
        console.error('In-memory MongoDB startup failed:', memErr.message);
        process.exit(1);
    }
}

async function seedDatabase() {
    try {
        // Connect to MongoDB with fallbacks
        await connectDB();

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const insertedProducts = await Product.insertMany(products);
        console.log(`Successfully inserted ${insertedProducts.length} products:`);
        insertedProducts.forEach(p => console.log(`  - ${p.name} (PKR ${p.price})`));

        console.log('\nDatabase seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();

