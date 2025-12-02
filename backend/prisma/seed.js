const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash('admin', 10)
  const workerPassword = await bcrypt.hash('jonas', 10)
  const worker2Password = await bcrypt.hash('karolis', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@poster.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin'
    }
  })

  const jonas = await prisma.user.create({
    data: {
      email: 'jonas@poster.com',
      password: workerPassword,
      name: 'Jonas Armalis',
      role: 'worker'
    }
  })

  const karolis = await prisma.user.create({
    data: {
      email: 'karolis@poster.com',
      password: worker2Password,
      name: 'Karolis Daunoravicius',
      role: 'worker'
    }
  })

  const post1 = await prisma.post.create({
    data: {
      title: 'Hello world',
      body: 'This is a test speaking',
      userId: admin.id
    }
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'Second post',
      body: 'Another example post created for testing.',
      userId: karolis.id
    }
  })

  await prisma.comment.create({
    data: {
      content: 'Nice post!',
      postId: post1.id,
      userId: jonas.id
    }
  })

  console.log('Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
