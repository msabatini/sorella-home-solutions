const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
require('dotenv').config();

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const blogPosts = [
  {
    title: 'While You\'re Chasing Sunshine, We\'re Caring for Home',
    subtitle: 'Your South Shore home deserves the same care while you\'re soaking up the sun.',
    author: 'Sorella Home Solutions',
    date: new Date('2025-09-08T09:00:00'),
    category: 'Seasonal Care',
    tags: ['seasonal', 'property-management', 'peace-of-mind'],
    featuredImage: '/SHS-blog-page-blog1.jpg',
    introText: 'Every October, as the last hydrangeas fade and the air turns crisp, a quiet ritual unfolds across the South Shore. Suitcases are packed. Porch furniture is covered. Flights are booked to Palm Beach, Naples, and Charleston. Our clients head south — chasing the sun, trading snow boots for sandals — and Sorella Home Solutions steps in to care for what\'s left behind.',
    contentSections: [
      {
        heading: 'The Comfort of Knowing Someone\'s Home',
        content: 'We know that leaving your home for the winter isn\'t as simple as locking the door and walking away. There\'s always that lingering thought — what if the heat goes out? What if there\'s a storm? What if something happens while we\'re gone?\n\nThat\'s where we come in. When you hand us your keys, you\'re not just hiring a property manager — you\'re gaining a trusted partner who treats your home like our own. We walk through every room, test every system, and prepare your property to weather the months ahead. Once you\'re gone, we continue to visit regularly, quietly ensuring everything is just as it should be.'
      },
      {
        heading: 'The Season of Watchful Care',
        content: 'New England winters can be unforgiving. Pipes freeze. Branches fall. Power flickers. But with Sorella, your home is never unattended.\n\nEach week, our team performs detailed inspections — checking heating systems, looking for signs of leaks or ice dams, confirming security systems are active, and ensuring vendors are completing snow removal and maintenance on schedule. If an issue arises, we handle it immediately through our network of trusted partners, often before you\'re even aware something happened.\n\nFor you, it\'s simple: a short update, a few photos, and the peace of mind that everything back home is under control.'
      },
      {
        heading: 'Preparing for Your Return',
        content: 'As winter begins to fade and you start thinking about returning home, we shift gears. The same care that went into protecting your home now goes into preparing it for your arrival. We coordinate cleanings, restock your essentials, turn up the heat, and make sure the lights are warm and welcoming.\n\nBy the time you walk through the door, your home feels exactly as you left it — only better.'
      },
      {
        heading: 'Because Home Should Always Feel Effortless',
        content: 'At Sorella, we believe luxury isn\'t about extravagance — it\'s about ease. It\'s about knowing that no matter where you are in the world, the place you call home is cared for with precision, discretion, and heart.\n\nSo go ahead — chase the sun, linger a little longer, and savor your time away. We\'ll be here, tending to the details, so your home always welcomes you back with grace.'
      }
    ],
    metaDescription: 'Discover how Sorella Home Solutions provides seasonal property management for South Shore homes. Expert care while you\'re away.',
    published: true
  },
  {
    title: 'Move Effortlessly with Sorella Home Solutions',
    subtitle: 'From packing to unpacking — we handle every detail of your move so you don\'t have to.',
    author: 'Sorella Home Solutions',
    date: new Date('2025-10-12T11:30:00'),
    category: 'Move Management',
    tags: ['moving', 'relocation', 'life-changes'],
    featuredImage: '/SHS-blog-page-blog12.jpg',
    introText: 'Every move tells a story. A growing family finding more space. Empty nesters trading the suburbs for the city. A new chapter by the coast. Whatever the reason, moving represents possibility — but also, let\'s be honest, a lot of logistics.\n\nAt Sorella Home Solutions, we believe a move should feel exciting, not exhausting. Our Move Management Services are designed to handle every detail with the same precision and care we bring to managing your home — so you can focus on the life you\'re building, not the boxes behind it.',
    contentSections: [
      {
        heading: 'From Chaos to Calm',
        content: 'If you\'ve ever moved before, you know how quickly excitement can turn into overwhelm. Packing, labeling, scheduling movers, forwarding mail, cleaning, and coordinating installations — it\'s a full-time job.\n\nThat\'s where Sorella steps in. We act as your personal project manager, orchestrating the entire process from start to finish. We create detailed timelines, manage vendors, oversee packing and unpacking, and ensure nothing slips through the cracks.\n\nWhether you\'re moving across town or across the country, we bring calm to the chaos — transforming what could be stressful into something seamless.'
      },
      {
        heading: 'The Art of Editing — Purging and Organizing with Purpose',
        content: 'A move is also an opportunity to reset — to let go of what no longer serves you and make room for what will. Our team helps clients sort, donate, and thoughtfully organize their belongings before the move even begins.\n\nWe coordinate donation pickups, consignment, and disposal with discretion and efficiency, ensuring that only what you truly love makes its way to your new home. When you arrive, everything is in its place — organized, intentional, and beautifully arranged.'
      },
      {
        heading: 'Settling In with Ease',
        content: 'We don\'t believe "move-in day" should mean living out of boxes. Once your belongings arrive, Sorella oversees every detail — from furniture placement and art installation to stocking the refrigerator and making sure the beds are made.\n\nWhen we\'re done, your new home feels like home — not a project waiting to be finished. Clients often tell us they\'ve never experienced such an effortless transition. To us, that\'s the highest compliment.'
      },
      {
        heading: 'Every Move, Managed with Care',
        content: 'No two moves are the same. Some clients want us to manage the entire process; others simply need help with the finishing touches. Whatever the scope, our approach is always the same — organized, discreet, and deeply personal.\n\nAt Sorella, we believe moving shouldn\'t drain your time or energy. It should be a continuation of your story — handled with care, grace, and precision.'
      }
    ],
    metaDescription: 'Professional move management services for your next relocation. From planning to unpacking, Sorella handles every detail.',
    published: true
  }
];

const seedBlog = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorella-home-solutions';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts');

    // Generate slugs for each post
    const postsWithSlugs = blogPosts.map(post => ({
      ...post,
      slug: generateSlug(post.title)
    }));

    // Insert seed data
    const created = await BlogPost.insertMany(postsWithSlugs);
    console.log(`✅ Seeded ${created.length} blog posts`);

    created.forEach(post => {
      console.log(`  - "${post.title}" (${post.readTime} min read)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blog:', error);
    process.exit(1);
  }
};

seedBlog();