import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SalesData {
  id?: number
  invoice_number: number
  transaction_type: string
  date: string
  account_number: string
  customer: string
  product: string
  mass: number
  sales_value: number
  sales_qty: number
  r_kg: number
  created_at?: string
}
