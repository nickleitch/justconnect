import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    const { error: createTableError } = await supabase.rpc('create_sales_table', {})
    
    if (createTableError) {
      console.log('Table might already exist, trying direct creation...')
      
      const { error: testError } = await supabase
        .from('sales_data')
        .select('id')
        .limit(1)
      
      if (testError && testError.message.includes('relation "sales_data" does not exist')) {
        throw new Error('Database table does not exist. Please create the sales_data table manually in Supabase.')
      }
    }
    
    console.log('Database initialization completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Database initialization failed:', error)
    return { success: false, error: error.message }
  }
}

export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('sales_data')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('Database connection test successful')
    return { success: true, data }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return { success: false, error: error.message }
  }
}
