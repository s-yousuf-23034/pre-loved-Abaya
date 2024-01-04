const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI;
    console.log("DB_URI from env: ", dbUri);

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Database connected!");
  } catch (err) {
    console.error("Error connecting to database:", err);
    // You might want to throw an error here or handle it according to your application's flow
  }
};

module.exports = connectDB;