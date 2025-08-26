import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create specialization categories
  const techCategory = await prisma.specializationCategory.create({
    data: {
      name: 'Technology',
      description: 'Fields related to software, hardware, and IT',
    },
  });

  const designCategory = await prisma.specializationCategory.create({
    data: {
      name: 'Design',
      description: 'Creative and visual design disciplines',
    },
  });

  const businessCategory = await prisma.specializationCategory.create({
    data: {
      name: 'Business',
      description: 'Business management and entrepreneurship',
    },
  });

  // Create specializations
  await prisma.specialization.createMany({
    data: [
      {
        name: 'Web Development',
        categoryId: techCategory.id,
        description: 'Building and maintaining web applications',
      },
      {
        name: 'Data Science',
        categoryId: techCategory.id,
        description: 'Data analysis, machine learning, and AI',
      },
      {
        name: 'UI/UX Design',
        categoryId: designCategory.id,
        description: 'Designing user interfaces and experiences',
      },
      {
        name: 'Graphic Design',
        categoryId: designCategory.id,
        description: 'Creating visual content and branding',
      },
      {
        name: 'Entrepreneurship',
        categoryId: businessCategory.id,
        description: 'Starting and managing businesses',
      },
      {
        name: 'Marketing',
        categoryId: businessCategory.id,
        description: 'Strategies for promoting products and services',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });