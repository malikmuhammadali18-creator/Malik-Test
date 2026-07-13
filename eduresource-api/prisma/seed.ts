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
  let school = await prisma.school.findFirst({ where: { name: 'Greenwood Academy' } });
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'Greenwood Academy',
        city: 'New York',
        country: 'United States',
        status: 'Active',
      },
    });
  }

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduresource.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@eduresource.com',
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
  const grade1 = await prisma.grade.upsert({
    where: { name: 'Grade 1' },
    update: {},
    create: { name: 'Grade 1' },
  });

  const grade5 = await prisma.grade.upsert({
    where: { name: 'Grade 5' },
    update: {},
    create: { name: 'Grade 5' },
  });

  const grade10 = await prisma.grade.upsert({
    where: { name: 'Grade 10' },
    update: {},
    create: { name: 'Grade 10' },
  });

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
  console.log('  Admin:        admin@eduresource.com / Admin@1234');
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
