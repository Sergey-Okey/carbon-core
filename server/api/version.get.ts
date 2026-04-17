import { neon } from '@neondatabase/serverless'

export default defineEventHandler(async () => {
  const sql = neon(process.env.DATABASE_URL!)
  const [response] = await sql`SELECT version()`
  return { version: response.version }
})
