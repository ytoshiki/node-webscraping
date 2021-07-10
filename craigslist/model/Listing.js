const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: String,
  date: Date,
  location: String,
  url: String,
  jobDescription: String,
  compensation: String
});

const Listing = mongoose.model('Listing', ListingSchema);

module.exports = Listing;
