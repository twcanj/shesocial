#!/usr/bin/env node
// Seed Events Script - Creates a dozen diverse social events for testing
// Run with: node server/scripts/seed-events.js

const NeDBSetup = require('../dist/db/nedb-setup.js').default
const { EventModel } = require('../dist/models/Event.js')

// Generate sample events with diverse categories and schedules
const SAMPLE_EVENTS = [
  {
    name: "台北101浪漫晚餐約會",
    metadata: {
      date: new Date('2025-07-25T18:00:00Z'),
      location: "台北101觀景餐廳",
      category: "美食約會",
      type: "4hour_dining",
      pricing: {
        male: 1200,
        female: 800,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 25,
        ageMax: 45,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 20,
    status: "published"
  },
  {
    name: "陽明山賞櫻一日遊",
    metadata: {
      date: new Date('2025-07-27T09:00:00Z'),
      location: "陽明山國家公園",
      category: "戶外活動",
      type: "1day_trip",
      pricing: {
        male: 800,
        female: 600,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 22,
        ageMax: 50,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 30,
    status: "published"
  },
  {
    name: "墾丁海岸兩日遊",
    metadata: {
      date: new Date('2025-08-02T08:00:00Z'),
      location: "墾丁國家公園",
      category: "兩日遊",
      type: "2day_trip",
      pricing: {
        male: 2500,
        female: 2000,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 28,
        ageMax: 42,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 24,
    status: "published"
  },
  {
    name: "信義區精品咖啡品鑑",
    metadata: {
      date: new Date('2025-07-30T14:00:00Z'),
      location: "信義區咖啡廳",
      category: "文化藝術",
      type: "4hour_dining",
      pricing: {
        male: 600,
        female: 400,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 24,
        ageMax: 38,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 16,
    status: "published"
  },
  {
    name: "淡水老街文化之旅",
    metadata: {
      date: new Date('2025-08-05T10:00:00Z'),
      location: "淡水老街",
      category: "文化體驗",
      type: "1day_trip",
      pricing: {
        male: 900,
        female: 700,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 26,
        ageMax: 48,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 28,
    status: "published"
  },
  {
    name: "台中日月潭兩日遊",
    metadata: {
      date: new Date('2025-08-09T07:30:00Z'),
      location: "日月潭",
      category: "自然風光",
      type: "2day_trip",
      pricing: {
        male: 3200,
        female: 2800,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 30,
        ageMax: 45,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 22,
    status: "published"
  },
  {
    name: "西門町夜市美食探索",
    metadata: {
      date: new Date('2025-08-01T19:00:00Z'),
      location: "西門町夜市",
      category: "美食體驗",
      type: "4hour_dining",
      pricing: {
        male: 750,
        female: 550,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 23,
        ageMax: 40,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 32,
    status: "published"
  },
  {
    name: "北投溫泉放鬆之旅",
    metadata: {
      date: new Date('2025-08-07T11:00:00Z'),
      location: "北投溫泉區",
      category: "休閒放鬆",
      type: "1day_trip",
      pricing: {
        male: 1100,
        female: 900,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 27,
        ageMax: 50,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 18,
    status: "published"
  },
  {
    name: "花蓮太魯閣山海兩日遊",
    metadata: {
      date: new Date('2025-08-16T06:00:00Z'),
      location: "花蓮太魯閣",
      category: "山海美景",
      type: "2day_trip",
      pricing: {
        male: 3800,
        female: 3400,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 25,
        ageMax: 43,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 26,
    status: "published"
  },
  {
    name: "大安森林公園野餐約會",
    metadata: {
      date: new Date('2025-08-03T15:00:00Z'),
      location: "大安森林公園",
      category: "戶外休閒",
      type: "4hour_dining",
      pricing: {
        male: 500,
        female: 300,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 22,
        ageMax: 35,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 25,
    status: "published"
  },
  {
    name: "故宮博物院藝術鑑賞",
    metadata: {
      date: new Date('2025-08-10T13:00:00Z'),
      location: "國立故宮博物院",
      category: "藝術文化",
      type: "4hour_dining",
      pricing: {
        male: 850,
        female: 650,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 28,
        ageMax: 45,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 20,
    status: "published"
  },
  {
    name: "九份老街懷舊之旅",
    metadata: {
      date: new Date('2025-08-12T12:00:00Z'),
      location: "九份老街",
      category: "懷舊文化",
      type: "1day_trip",
      pricing: {
        male: 950,
        female: 750,
        voucherDiscount: {
          '100': 100,
          '200': 200
        }
      },
      requirements: {
        ageMin: 24,
        ageMax: 42,
        maritalStatus: "single"
      },
      schedule: {
        frequency: "biweekly",
        cycle: "3months",
        totalEvents: 6,
        twoDayTrips: 2
      }
    },
    maxParticipants: 30,
    status: "published"
  }
]

async function seedEvents() {
  console.log('🌱 Starting event seeding for InfinityMatch platform...\n')

  try {
    // Initialize database
    console.log('📊 Initializing database connections...')
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    console.log('✅ Database initialized successfully\n')

    // Initialize event model
    const eventModel = new EventModel(db.events)

    // Check if events already exist
    const existingEventsResult = await eventModel.count()
    if (existingEventsResult.success && existingEventsResult.data > 0) {
      console.log(`📋 Found ${existingEventsResult.data} existing events in database`)
      console.log('⚠️  Skipping seed - events already exist. To reseed, clear the database first.\n')
      return
    }

    // Create events
    console.log('🎉 Creating sample events...')
    const createdEvents = []

    for (const eventData of SAMPLE_EVENTS) {
      try {
        // Add participants and notification arrays
        const eventToCreate = {
          ...eventData,
          participants: [], // Empty participants array
          participantVisibility: {
            vvip: true,
            vip: false,
            registered: false
          },
          notifications: {
            sent: false,
            recipients: []
          }
        }

        const result = await eventModel.create(eventToCreate)
        if (result.success) {
          console.log(`  ✅ Created event: ${eventData.name}`)
          console.log(`     📅 Date: ${eventData.metadata.date.toLocaleDateString('zh-TW')}`)
          console.log(`     📍 Location: ${eventData.metadata.location}`)
          console.log(`     💰 Price: $${eventData.metadata.pricing.male}(男) / $${eventData.metadata.pricing.female}(女)`)
          console.log(`     👥 Max participants: ${eventData.maxParticipants}`)
          console.log('')
          createdEvents.push(result.data)
        } else {
          console.log(`  ❌ Failed to create event ${eventData.name}: ${result.error}`)
        }
      } catch (error) {
        console.log(`  ❌ Error creating event ${eventData.name}: ${error.message}`)
      }
    }

    console.log(`\n✅ Successfully created ${createdEvents.length}/${SAMPLE_EVENTS.length} events\n`)

    // Summary
    console.log('📋 EVENT SEEDING SUMMARY')
    console.log('='.repeat(50))
    console.log(`🎉 Total events created: ${createdEvents.length}`)
    console.log(`📅 Date range: ${new Date('2025-07-25').toLocaleDateString('zh-TW')} - ${new Date('2025-08-16').toLocaleDateString('zh-TW')}`)
    console.log(`📍 Locations: Taipei, Taichung, Kenting, Hualien areas`)
    console.log(`💰 Price range: NT$300 - NT$3,800`)
    console.log(`👥 Participant capacity: 16 - 32 people per event`)
    console.log('')

    // Event categories breakdown
    const categories = {}
    createdEvents.forEach(event => {
      const category = event.metadata.category
      categories[category] = (categories[category] || 0) + 1
    })

    console.log('📊 Event categories:')
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} events`)
    })

    console.log('\n🚀 NEXT STEPS:')
    console.log('1. Start the server: npm run dev:server')
    console.log('2. Visit: http://localhost:5173/events')
    console.log('3. Test event browsing and booking functionality')
    console.log('4. Test different membership levels (visitor, registered, vip, vvip)')
    console.log('')
    console.log('🌟 Event seeding completed successfully!')
  } catch (error) {
    console.error('❌ Fatal error during event seeding:', error)
    process.exit(1)
  }
}

// Main execution
seedEvents()
  .then(() => {
    console.log('\n✅ Event seeding process finished.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Event seeding failed:', error)
    process.exit(1)
  })

module.exports = { seedEvents }