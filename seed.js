import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import Hotel from './src/models/Hotel.js';
import Room from './src/models/Room.js';

dotenv.config();

const hotelsData = [
  {
    name: 'Grand Horizon Resort',
    description: 'Experience luxury at its finest with our beachfront resort featuring world-class amenities and breathtaking ocean views.',
    address: {
      line1: '123 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      postalCode: '33139'
    },
    amenities: ['Pool', 'Spa', 'Free WiFi', 'Fitness Center', 'Beach Access'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719508461-905c673771fd'],
    status: 'APPROVED',
  },
  {
    name: 'Mountain View Lodge',
    description: 'A cozy retreat nestled in the mountains, perfect for skiing in the winter and hiking in the summer.',
    address: {
      line1: '456 Alpine Way',
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      postalCode: '80202'
    },
    amenities: ['Ski Storage', 'Fireplace', 'Free WiFi', 'Restaurant'],
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
    status: 'APPROVED',
  },
  {
    name: 'Urban Boutique Hotel',
    description: 'Located in the heart of the city, offering modern design and easy access to top attractions.',
    address: {
      line1: '789 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001'
    },
    amenities: ['Rooftop Bar', 'Free WiFi', 'Gym', 'Business Center'],
    images: ['https://images.unsplash.com/photo-1551882547-ff40eb0d1b73', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
    status: 'PENDING',
  }
];

const roomsData = [
  {
    name: 'Oceanfront Suite',
    description: 'Spacious suite with a private balcony overlooking the ocean.',
    roomType: 'suite',
    pricePerNight: 350,
    maxGuests: 4,
    totalRooms: 10,
    bedType: 'king',
    amenities: ['Sea View', 'Mini Bar', 'Bathtub'],
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'],
  },
  {
    name: 'Standard Queen Room',
    description: 'Comfortable room for a quick getaway.',
    roomType: 'standard',
    pricePerNight: 150,
    maxGuests: 2,
    totalRooms: 20,
    bedType: 'queen',
    amenities: ['TV', 'AC', 'Coffee Maker'],
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'],
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a mock hotel owner
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    let owner = await User.findOne({ email: 'seedowner@example.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Seed Owner',
        email: 'seedowner@example.com',
        password: hashedPassword,
        role: 'hotel_owner',
        isEmailVerified: true,
      });
      console.log('Created mock hotel owner');
    }

    // Create hotels
    for (const hotelInfo of hotelsData) {
      const existingHotel = await Hotel.findOne({ name: hotelInfo.name });
      if (!existingHotel) {
        const hotel = await Hotel.create({
          ...hotelInfo,
          ownerId: owner._id,
        });
        console.log(`Created hotel: ${hotel.name}`);

        // Create rooms for the approved hotels
        if (hotel.status === 'APPROVED') {
          for (const roomInfo of roomsData) {
            await Room.create({
              ...roomInfo,
              hotelId: hotel._id,
            });
            console.log(`  - Added room: ${roomInfo.name}`);
          }
        }
      } else {
        console.log(`Hotel ${hotelInfo.name} already exists. Skipping.`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();
