export interface MissedOrder {
  id: string;
  account_number: string;
  customer_name: string;
  days_overdue: number;
  expected_order_value: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  last_order_date: string;
  customer_type: string;
  avg_order_frequency: number;
}

export interface RangeOpportunity {
  id: string;
  account_number: string;
  customer_name: string;
  product_code: string;
  product_name: string;
  adoption_rate: number;
  potential_monthly_value: number;
  similar_customers_count: number;
  customer_type: string;
}

export interface FieldObservation {
  id: string;
  customer_id: string;
  customer_name: string;
  rep_id: string;
  visit_date: string;
  competitor_products: string[];
  out_of_stock_items: string[];
  customer_feedback: string;
  pricing_notes: string;
  foot_traffic: 'low' | 'medium' | 'high';
}

export const mockMissedOrders: MissedOrder[] = [
  {
    id: '1',
    account_number: '5523',
    customer_name: 'MEDINA BUTCHERY',
    days_overdue: 8,
    expected_order_value: 2450,
    risk_level: 'HIGH',
    last_order_date: '2025-06-15',
    customer_type: 'butchery',
    avg_order_frequency: 7
  },
  {
    id: '2',
    account_number: '5524',
    customer_name: 'GOLDEN GATE SPAR',
    days_overdue: 5,
    expected_order_value: 3200,
    risk_level: 'MEDIUM',
    last_order_date: '2025-06-18',
    customer_type: 'retailer_chain',
    avg_order_frequency: 10
  },
  {
    id: '3',
    account_number: '5525',
    customer_name: 'OCEAN VIEW RESTAURANT',
    days_overdue: 12,
    expected_order_value: 1800,
    risk_level: 'HIGH',
    last_order_date: '2025-06-11',
    customer_type: 'food_service',
    avg_order_frequency: 14
  },
  {
    id: '4',
    account_number: '5526',
    customer_name: 'HILLCREST BUTCHERY',
    days_overdue: 3,
    expected_order_value: 2100,
    risk_level: 'LOW',
    last_order_date: '2025-06-20',
    customer_type: 'butchery',
    avg_order_frequency: 7
  },
  {
    id: '5',
    account_number: '5527',
    customer_name: 'CAPE TOWN CATERING',
    days_overdue: 6,
    expected_order_value: 4500,
    risk_level: 'MEDIUM',
    last_order_date: '2025-06-17',
    customer_type: 'food_service',
    avg_order_frequency: 12
  }
];

export const mockRangeOpportunities: RangeOpportunity[] = [
  {
    id: '1',
    account_number: '5523',
    customer_name: 'MEDINA BUTCHERY',
    product_code: 'RBURG',
    product_name: 'Crumbed Burger Patties',
    adoption_rate: 0.75,
    potential_monthly_value: 850,
    similar_customers_count: 12,
    customer_type: 'butchery'
  },
  {
    id: '2',
    account_number: '5523',
    customer_name: 'MEDINA BUTCHERY',
    product_code: 'RBITE',
    product_name: 'Crumbed Chicken Bites',
    adoption_rate: 0.67,
    potential_monthly_value: 650,
    similar_customers_count: 10,
    customer_type: 'butchery'
  },
  {
    id: '3',
    account_number: '5524',
    customer_name: 'GOLDEN GATE SPAR',
    product_code: 'WBQ6',
    product_name: 'BBQ Winglets',
    adoption_rate: 0.80,
    potential_monthly_value: 1200,
    similar_customers_count: 8,
    customer_type: 'retailer_chain'
  },
  {
    id: '4',
    account_number: '5525',
    customer_name: 'OCEAN VIEW RESTAURANT',
    product_code: 'ESPE',
    product_name: 'BBQ Espetada',
    adoption_rate: 0.90,
    potential_monthly_value: 950,
    similar_customers_count: 15,
    customer_type: 'food_service'
  },
  {
    id: '5',
    account_number: '5526',
    customer_name: 'HILLCREST BUTCHERY',
    product_code: 'RNUG',
    product_name: 'Crumbed Nuggets',
    adoption_rate: 0.70,
    potential_monthly_value: 750,
    similar_customers_count: 9,
    customer_type: 'butchery'
  }
];

export const mockFieldObservations: FieldObservation[] = [
  {
    id: '1',
    customer_id: '5523',
    customer_name: 'MEDINA BUTCHERY',
    rep_id: 'REP001',
    visit_date: '2025-06-23',
    competitor_products: ['Rainbow Chicken', 'Country Fair'],
    out_of_stock_items: ['CCAR', 'D6-F'],
    customer_feedback: 'Customer mentioned interest in expanding frozen range',
    pricing_notes: 'Competitor pricing 5% lower on chicken backs',
    foot_traffic: 'high'
  },
  {
    id: '2',
    customer_id: '5524',
    customer_name: 'GOLDEN GATE SPAR',
    rep_id: 'REP002',
    visit_date: '2025-06-22',
    competitor_products: ['Astro Chicken', 'Farmer Brown'],
    out_of_stock_items: ['RBURG'],
    customer_feedback: 'Store manager wants to discuss bulk pricing',
    pricing_notes: 'Good margin on current products',
    foot_traffic: 'medium'
  },
  {
    id: '3',
    customer_id: '5525',
    customer_name: 'OCEAN VIEW RESTAURANT',
    rep_id: 'REP001',
    visit_date: '2025-06-21',
    competitor_products: ['Supreme Chicken'],
    out_of_stock_items: [],
    customer_feedback: 'Happy with quality, considering larger orders',
    pricing_notes: 'Willing to pay premium for consistent quality',
    foot_traffic: 'high'
  }
];

export const productMapping = {
  'CCAR': 'Chicken Backs (Fresh)',
  'RBURG': 'Crumbed Burger Patties',
  'RBITE': 'Crumbed Chicken Bites',
  'RNUG': 'Crumbed Nuggets',
  'CBBQ-C': 'BBQ Deli Grillers',
  'D6-F': 'Drumsticks 6-pack',
  'T12F': 'Thighs 12-pack',
  'WBQ6': 'BBQ Winglets',
  'ESPE': 'BBQ Espetada'
};
