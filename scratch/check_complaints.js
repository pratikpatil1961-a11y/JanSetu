
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend folder
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safebridge';

async function checkComplaints() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false }));
    const complaints = await Complaint.find({ category: 'Waste Management' }).limit(5);

    console.log('Recent Waste Management Complaints:');
    console.log(JSON.stringify(complaints, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkComplaints();
