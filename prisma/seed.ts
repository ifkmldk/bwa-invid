import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPasswordHash = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
      name: 'Admin User'
    }
  })

  // Create categories
  const categories = [
    { name: 'Modern', sortOrder: 1 },
    { name: 'Traditional', sortOrder: 2 },
    { name: 'Minimalist', sortOrder: 3 },
    { name: 'Luxury', sortOrder: 4 },
    { name: 'Islamic', sortOrder: 5 }
  ]

  const createdCategories = await Promise.all(
    categories.map(cat => 
      prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat
      })
    )
  )

  // Create starter templates
  const templates = [
    {
      name: 'Elegant Modern',
      slug: 'elegant-modern',
      categoryId: createdCategories[0].id, // Modern
      tier: 'free',
      themeConfig: JSON.stringify({
        primaryColor: '#2563eb',
        secondaryColor: '#1d4ed8',
        accentColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        layout: 'modern'
      }),
      componentRef: 'ElegantModernTemplate',
      isActive: true
    },
    {
      name: 'Classic Traditional',
      slug: 'classic-traditional',
      categoryId: createdCategories[1].id, // Traditional
      tier: 'free',
      themeConfig: JSON.stringify({
        primaryColor: '#dc2626',
        secondaryColor: '#b91c1c',
        accentColor: '#ef4444',
        backgroundColor: '#fef2f2',
        textColor: '#7f1d1d',
        fontFamily: 'Playfair Display',
        layout: 'traditional'
      }),
      componentRef: 'ClassicTraditionalTemplate',
      isActive: true
    },
    {
      name: 'Clean Minimalist',
      slug: 'clean-minimalist',
      categoryId: createdCategories[2].id, // Minimalist
      tier: 'free',
      themeConfig: JSON.stringify({
        primaryColor: '#64748b',
        secondaryColor: '#475569',
        accentColor: '#94a3b8',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        fontFamily: 'Helvetica Neue',
        layout: 'minimalist'
      }),
      componentRef: 'CleanMinimalistTemplate',
      isActive: true
    }
  ]

  await Promise.all(
    templates.map(tpl => 
      prisma.template.upsert({
        where: { slug: tpl.slug },
        update: {},
        create: tpl
      })
    )
  )

  console.log({ admin, categories: createdCategories, templates })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
