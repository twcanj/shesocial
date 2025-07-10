// Debug exports test
console.log('🔍 DEBUG: Testing all exports from database.ts')

import * as allExports from './types/database'
console.log('🔍 DEBUG: All exports:', Object.keys(allExports))

try {
  import('./types/database').then(module => {
    console.log('🔍 DEBUG: Dynamic import success:', Object.keys(module))
    console.log('🔍 DEBUG: UserProfile exists?', 'UserProfile' in module)
  })
} catch (error) {
  console.error('🔍 DEBUG: Dynamic import failed:', error)
}