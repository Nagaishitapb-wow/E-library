const mongoose = require('mongoose');

async function checkCategories() {
    try {
        await mongoose.connect('mongodb://localhost:27017/test'); // Adjust DB name if needed, usually 'library' or 'test'
        const Category = mongoose.model('Category', new mongoose.Schema({ name: String }));
        const categories = await Category.find();
        console.log('Categories found:', JSON.stringify(categories, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCategories();
