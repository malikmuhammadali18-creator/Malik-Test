require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const grades = await prisma.grade.findMany({ orderBy: { name: 'asc' } });
    const names = grades.map((g) => g.name);
    require('fs').writeFileSync('tmp_grade_names.json', JSON.stringify(names, null, 2));
  } catch (err) {
    require('fs').writeFileSync('tmp_grade_names.json', JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
