import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    const { error, count } = await supabase
      .from('sales_data')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error querying database:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        count: 0 
      })
    }
    
    console.log(`Total rows in sales_data table: ${count}`)
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('sales_data')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError)
      return NextResponse.json({ 
        success: false, 
        error: sampleError.message,
        count: count || 0 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      count: count || 0,
      sampleData: sampleData || [],
      message: `Database connection successful. Found ${count} records.`
    })
    
  } catch (error: unknown) {
    console.error('Database test failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      count: 0 
    })
  }
}
