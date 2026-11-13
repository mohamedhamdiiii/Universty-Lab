const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/equipments', require('./routes/equipmentRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Lab Booking API is running' });
});

// Seed sample equipment if table is empty
const seedSampleEquipment = async () => {
  try {
    const Equipment = require('./models/Equipment');
    const count = await Equipment.count();
    if (count === 0) {
      await Equipment.bulkCreate([
        {
          name: 'Sony Alpha A7 IV Camera',
          description: 'Full-frame mirrorless camera with 33MP sensor and 4K 60p video capabilities.',
          category: 'camera',
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
          available: true,
          quantity: 4
        },
        {
          name: 'Canon EOS R6 Mark II',
          description: 'High-performance hybrid camera with 24.2 MP CMOS sensor and advanced autofocus.',
          category: 'camera',
          imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
          available: true,
          quantity: 3
        },
        {
          name: 'Prusa i3 MK3S+ 3D Printer',
          description: 'Reliable FDM 3D printer with heated magnetic bed and automated mesh bed leveling.',
          category: '3d-printer',
          imageUrl: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=500',
          available: true,
          quantity: 2
        },
        {
          name: 'UltiMaker S5 3D Printer',
          description: 'Dual-extrusion professional 3D printer with large build volume and active leveling.',
          category: '3d-printer',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
          available: true,
          quantity: 1
        },
        {
          name: 'Arduino Advanced Starter Kit',
          description: 'Comprehensive kit with Arduino Uno R3, sensors, relays, LCD display and motors.',
          category: 'lab-kit',
          imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500',
          available: true,
          quantity: 10
        },
        {
          name: 'Raspberry Pi 4 Model B (8GB)',
          description: 'Quad-core 64-bit ARM processor with dual 4K micro-HDMI outputs and Gigabit Ethernet.',
          category: 'lab-kit',
          imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500',
          available: true,
          quantity: 6
        },
        {
          name: 'Digital Storage Oscilloscope 100MHz',
          description: '2-channel digital oscilloscope with 1GSa/s real-time sample rate.',
          category: 'other',
          imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500',
          available: true,
          quantity: 5
        }
      ]);
      console.log('Sample equipment seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding equipment:', err.message);
  }
};

// Connect to MySQL and start server
const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
  await seedSampleEquipment();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
