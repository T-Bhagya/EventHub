import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EventHub database seeding...');

  // Clean existing tables
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Test Accounts & Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Thilini Bhagya',
      email: 'user@eventhub.lk',
      phone: '+94 77 123 4567',
      passwordHash,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Kavindu Perera',
      email: 'user2@eventhub.lk',
      phone: '+94 71 987 6543',
      passwordHash,
      role: 'USER',
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      name: 'Sri Lanka Events Ltd',
      email: 'organizer@eventhub.lk',
      phone: '+94 11 234 5678',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Colombo Tech Society',
      email: 'organizer2@eventhub.lk',
      phone: '+94 11 876 5432',
      passwordHash,
      role: 'ORGANIZER',
    },
  });

  console.log('✅ Created users and organizers');

  // 2. Create Events
  const eventsData = [
    {
      title: 'Colombo Tech Meetup 2026',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      description: 'Join developers, founders, and tech enthusiasts in Colombo for an evening of insightful keynotes, AI panel discussions, and networking.',
      date: '2026-10-15',
      time: '17:30',
      location: 'BMICH, Bauddhaloka Mawatha, Colombo 07',
      category: 'Technology',
      price: 0,
      totalSeats: 120,
      availableSeats: 115,
      organizerId: organizer2.id,
    },
    {
      title: 'Sunset Music Festival',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      description: 'Experience an unforgettable evening of live indie fusion, electronic beats, and acoustic performances right by the Indian Ocean.',
      date: '2026-11-05',
      time: '16:00',
      location: 'Galle Face Green, Colombo 03',
      category: 'Music',
      price: 3500,
      totalSeats: 500,
      availableSeats: 492,
      organizerId: organizer1.id,
    },
    {
      title: 'Startup Founders Workshop',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
      description: 'Master pitch deck creation, seed funding strategies, and unit economics with experienced Sri Lankan venture capitalists.',
      date: '2026-10-20',
      time: '09:00',
      location: 'Hatch Works, 14 Sir Baron Jayathilaka Mawatha, Colombo 01',
      category: 'Business',
      price: 2000,
      totalSeats: 50,
      availableSeats: 48,
      organizerId: organizer2.id,
    },
    {
      title: 'Food & Culture Festival',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      description: 'Taste authentic island street food, traditional sweets, fusion culinary masterclasses, and vibrant cultural dance shows.',
      date: '2026-10-28',
      time: '10:00',
      location: 'Viharamahadevi Park, Colombo 07',
      category: 'Food',
      price: 0,
      totalSeats: 300,
      availableSeats: 300,
      organizerId: organizer1.id,
    },
    {
      title: 'Mobile App Development Bootcamp',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      description: 'Intensive hands-on workshop covering React Native, Expo Router, and REST API integration for mobile engineers.',
      date: '2026-11-12',
      time: '09:30',
      location: 'Faculty of Computing, University Auditorium, Colombo',
      category: 'Education',
      price: 5000,
      totalSeats: 40,
      availableSeats: 40,
      organizerId: organizer2.id,
    },
    {
      title: 'Weekend Art Exhibition',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      description: 'Discover contemporary canvas paintings, sculptures, and digital art created by talented young artists across Sri Lanka.',
      date: '2026-10-24',
      time: '10:00',
      location: 'Lionel Wendt Art Centre, 18 Guildford Cres, Colombo 07',
      category: 'Art',
      price: 1000,
      totalSeats: 80,
      availableSeats: 80,
      organizerId: organizer1.id,
    },
    {
      title: 'Community Beach Cleanup',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      description: 'Join hands with environmental volunteers to clean up coastline marine debris and preserve Mount Lavinia coastal habitat.',
      date: '2026-10-10',
      time: '07:00',
      location: 'Mount Lavinia Beach, Mount Lavinia',
      category: 'Community',
      price: 0,
      totalSeats: 150,
      availableSeats: 150,
      organizerId: organizer1.id,
    },
    {
      title: 'Inter-University Sports Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      description: 'Cheer on university track and field athletes competing in 100m sprints, relays, and long jumps.',
      date: '2026-11-20',
      time: '08:00',
      location: 'Sugathadasa Outdoor Stadium, Colombo 13',
      category: 'Sports',
      price: 500,
      totalSeats: 200,
      availableSeats: 200,
      organizerId: organizer1.id,
    },
    {
      title: 'Sri Lanka Gaming Expo 2026',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      description: 'The ultimate esports tournament and gaming convention featuring PC, console, and mobile game finals live on stage.',
      date: '2026-12-01',
      time: '11:00',
      location: 'SLECC, D. R. Wijewardena Mawatha, Colombo 10',
      category: 'Technology',
      price: 1500,
      totalSeats: 250,
      availableSeats: 250,
      organizerId: organizer2.id,
    },
    {
      title: 'Classical Symphony Concert',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      description: 'An elegant evening featuring Beethoven and Mozart masterpieces performed by the National Youth Orchestra.',
      date: '2026-11-28',
      time: '19:00',
      location: 'Nelum Pokuna Mahinda Rajapaksa Theatre, Colombo 07',
      category: 'Music',
      price: 4500,
      totalSeats: 180,
      availableSeats: 180,
      organizerId: organizer1.id,
    },
    {
      title: 'Organic Farming & Gardening Workshop',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
      description: 'Learn urban gardening techniques, composting, and pesticide-free vegetable cultivation in small residential spaces.',
      date: '2026-10-18',
      time: '08:30',
      location: 'Diyatha Uyana, Battaramulla',
      category: 'Education',
      price: 1200,
      totalSeats: 30,
      availableSeats: 2, // Nearly sold out demo
      organizerId: organizer1.id,
    },
    {
      title: 'Colombo Photography Walk',
      imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      description: 'Guided street photography walk exploring historical colonial architecture in Fort and lively colorful Pettah markets.',
      date: '2026-10-31',
      time: '15:30',
      location: 'Fort Railway Station Entrance, Colombo 01',
      category: 'Art',
      price: 0,
      totalSeats: 25,
      availableSeats: 25,
      organizerId: organizer2.id,
    },
  ];

  const createdEvents = [];
  for (const eventData of eventsData) {
    const e = await prisma.event.create({ data: eventData });
    createdEvents.push(e);
  }

  console.log(`✅ Created ${createdEvents.length} seeded events`);

  // 3. Create Sample Bookings
  // Tech meetup booking by User 1 (5 tickets)
  await prisma.booking.create({
    data: {
      bookingReference: 'EVH-8F32A1',
      userId: user1.id,
      eventId: createdEvents[0].id,
      ticketQuantity: 5,
      totalPrice: 0,
      phone: user1.phone,
      note: 'Reserving front seats for university student group',
      status: 'CONFIRMED',
    },
  });

  // Music Festival booking by User 1 (2 tickets)
  await prisma.booking.create({
    data: {
      bookingReference: 'EVH-2026-0001',
      userId: user1.id,
      eventId: createdEvents[1].id,
      ticketQuantity: 2,
      totalPrice: 7000,
      phone: user1.phone,
      note: 'VIP seating request if possible',
      status: 'CONFIRMED',
    },
  });

  // Music Festival booking by User 2 (6 tickets)
  await prisma.booking.create({
    data: {
      bookingReference: 'EVH-9B7C1D',
      userId: user2.id,
      eventId: createdEvents[1].id,
      ticketQuantity: 6,
      totalPrice: 21000,
      phone: user2.phone,
      note: 'Attending with family',
      status: 'CONFIRMED',
    },
  });

  // Startup Workshop booking by User 1 (2 tickets)
  await prisma.booking.create({
    data: {
      bookingReference: 'EVH-3K4L5M',
      userId: user1.id,
      eventId: createdEvents[2].id,
      ticketQuantity: 2,
      totalPrice: 4000,
      phone: user1.phone,
      status: 'CONFIRMED',
    },
  });

  console.log('✅ Created sample bookings');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
