import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST() {
  try {
    const testRecord = {
      invoice_number: 0,
      transaction_type: 'TEST',
      date: '2024-01-01',
      account_number: 'TEST',
      customer: 'TEST',
      product: 'TEST',
      mass: 0,
      sales_value: 0,
      sales_qty: 0,
      r_kg: 0
    }

    const { error } = await supabase
      .from('sales_data')
      .insert([testRecord])

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: `Database table may not exist: ${error.message}`,
        message: 'Please create the sales_data table manually in Supabase using the provided SQL schema.'
      }, { status: 500 })
    }

    await supabase
      .from('sales_data')
      .delete()
      .eq('transaction_type', 'TEST')

    return NextResponse.json({ success: true, message: 'Database table exists and is accessible' })
  } catch (error: unknown) {
    console.error('Database initialization error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sales_data')
      .select('id')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        message: 'Database table may not exist. Please create the sales_data table manually in Supabase.'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful', 
      recordCount: data?.length || 0 
    })
  } catch (error: unknown) {
    console.error('Database test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
