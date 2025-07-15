#!/usr/bin/env node
// Check Interviewer Data Script

const NeDBSetup = require('./server/dist/db/nedb-setup').default

async function checkInterviewers() {
  try {
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const interviewers = await new Promise((resolve, reject) => {
      db.interviewers.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    console.log('📊 Interviewer Data:')
    console.log(`Total interviewers: ${interviewers.length}`)
    
    interviewers.forEach((interviewer, index) => {
      console.log(`\n${index + 1}. Interviewer:`)
      console.log(JSON.stringify(interviewer, null, 2))
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkInterviewers()
