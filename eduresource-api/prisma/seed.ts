import 'dotenv/config';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create a school (School.name has no unique constraint, so upsert-by-id
  // isn't usable here; find-or-create by name instead)
  let school = await prisma.school.findFirst({ where: { name: 'Bait ul islam school Barki Campus' } });
  if (!school) {
    school = await prisma.school.findFirst({ where: { name: 'Greenwood Academy' } });
  }

  if (school) {
    school = await prisma.school.update({
      where: { id: school.id },
      data: {
        name: 'Bait ul islam school Barki Campus',
        address: 'Barki Lahore Cantt',
        city: 'Lahore',
        country: 'Pakistan',
        email: 'baitulislamschoolbarki@gmail.com',
        principal: 'Muhammad Ali',
        status: 'Active',
      },
    });
  } else {
    school = await prisma.school.create({
      data: {
        name: 'Bait ul islam school Barki Campus',
        address: 'Barki Lahore Cantt',
        city: 'Lahore',
        country: 'Pakistan',
        email: 'baitulislamschoolbarki@gmail.com',
        principal: 'Muhammad Ali',
        status: 'Active',
      },
    });
  }

  // Create admin user
  const adminHash = await bcrypt.hash('laptophp99', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'malikmuhammadali18@gmail.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'malikmuhammadali18@gmail.com',
      passwordHash: adminHash,
      role: Role.Admin,
      status: UserStatus.Active,
    },
  });

  // Create school admin
  const schoolAdminHash = await bcrypt.hash('SchoolAdmin@1234', 10);
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'schooladmin@greenwood.edu' },
    update: {},
    create: {
      firstName: 'School',
      lastName: 'Admin',
      email: 'schooladmin@greenwood.edu',
      passwordHash: schoolAdminHash,
      role: Role.SchoolAdmin,
      status: UserStatus.Active,
      schoolId: school.id,
    },
  });

  // Create teacher
  const teacherHash = await bcrypt.hash('Teacher@1234', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@greenwood.edu' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'teacher@greenwood.edu',
      passwordHash: teacherHash,
      role: Role.Teacher,
      status: UserStatus.Active,
      schoolId: school.id,
    },
  });

  // Create subjects
  const mathSubject = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics' },
  });

  const scienceSubject = await prisma.subject.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science' },
  });

  const englishSubject = await prisma.subject.upsert({
    where: { name: 'English' },
    update: {},
    create: { name: 'English' },
  });

  // Create grades
  const gradeNames = [
    'Play Group',
    'Nursery',
    'Prep',
    'Two',
    'Three',
    'Four',
    '6th',
    '7th',
    'Pre 9th',
    '9th',
    'Grade 1',
    'Grade 5',
    'Grade 10',
  ];

  for (const name of gradeNames) {
    await prisma.grade.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create categories
  const lessonCategory = await prisma.category.upsert({
    where: { name: 'Lesson Plans' },
    update: {},
    create: { name: 'Lesson Plans' },
  });

  const assessmentCategory = await prisma.category.upsert({
    where: { name: 'Assessments' },
    update: {},
    create: { name: 'Assessments' },
  });

  // Create tags
  const interactiveTag = await prisma.tag.upsert({
    where: { name: 'interactive' },
    update: {},
    create: { name: 'interactive' },
  });

  const beginnerTag = await prisma.tag.upsert({
    where: { name: 'beginner' },
    update: {},
    create: { name: 'beginner' },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Seed Credentials:');
  console.log('  Admin:        malikmuhammadali18@gmail.com / laptophp99');
  console.log('  School Admin: schooladmin@greenwood.edu / SchoolAdmin@1234');
  console.log('  Teacher:      teacher@greenwood.edu / Teacher@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
