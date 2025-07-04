import { supabase } from './supabase'

export const createSalesDataTable = async () => {
  const { error } = await supabase.rpc('create_sales_data_table')
  if (error) {
    console.error('Error creating table:', error)
    return false
  }
  return true
}

export const getSalesData = async (filters: {
  year?: number
  month?: number
  supplier?: string
  customer?: string
  product?: string
  productCategory?: string
  rep?: string
}) => {
  let query = supabase
    .from('sales_data')
    .select('*')

  if (filters.year) {
    query = query.gte('date', `${filters.year}-01-01`)
    query = query.lt('date', `${filters.year + 1}-01-01`)
  }

  if (filters.month && filters.year) {
    const monthNum = parseInt(filters.month.toString())
    const yearNum = parseInt(filters.year.toString())
    const monthStr = monthNum.toString().padStart(2, '0')
    query = query.gte('date', `${yearNum}-${monthStr}-01`)
    if (monthNum === 12) {
      query = query.lt('date', `${yearNum + 1}-01-01`)
    } else {
      const nextMonth = (monthNum + 1).toString().padStart(2, '0')
      query = query.lt('date', `${yearNum}-${nextMonth}-01`)
    }
  }

  if (filters.supplier) {
    query = query.ilike('product', `%${filters.supplier}%`)
  }

  if (filters.customer) {
    query = query.ilike('customer', `%${filters.customer}%`)
  }

  if (filters.product) {
    query = query.ilike('product', `%${filters.product}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sales data:', error)
    return []
  }

  return data || []
}

interface AggregatedFilters {
  year?: number
  month?: number
  supplier?: string
  customer?: string
  product?: string
  productCategory?: string
  rep?: string
  groupBy?: string
}

interface AggregatedRecord {
  sales_rands: number
  mass_kg: number
  sales_qty: number
  customer_count: Set<string>
  record_count: number
}

interface SalesDataRow {
  product: string
  customer: string
  sales_value: number
  mass: number
  sales_qty: number
}

export const getAggregatedData = async (filters: AggregatedFilters) => {
  const data = await getSalesData(filters)
  
  const aggregated = data.reduce((acc: Record<string, AggregatedRecord>, row: SalesDataRow) => {
    const key = filters.groupBy === 'product' ? row.product : 
                filters.groupBy === 'customer' ? row.customer :
                filters.groupBy === 'supplier' ? row.product : // Simplified supplier grouping
                'Total'

    if (!acc[key]) {
      acc[key] = {
        sales_rands: 0,
        mass_kg: 0,
        sales_qty: 0,
        customer_count: new Set(),
        record_count: 0
      }
    }

    acc[key].sales_rands += row.sales_value || 0
    acc[key].mass_kg += row.mass || 0
    acc[key].sales_qty += row.sales_qty || 0
    acc[key].customer_count.add(row.customer)
    acc[key].record_count += 1

    return acc
  }, {})

  return Object.entries(aggregated).map(([key, values]) => ({
    name: key,
    sales_rands: Math.round((values as AggregatedRecord).sales_rands),
    mass_kg: Math.round((values as AggregatedRecord).mass_kg),
    sales_qty: (values as AggregatedRecord).sales_qty,
    customer_count: (values as AggregatedRecord).customer_count.size,
    avg_price_per_kg: (values as AggregatedRecord).mass_kg > 0 ? Math.round(((values as AggregatedRecord).sales_rands / (values as AggregatedRecord).mass_kg) * 100) / 100 : 0,
    record_count: (values as AggregatedRecord).record_count
  }))
}
