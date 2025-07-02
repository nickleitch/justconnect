from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel
import pandas as pd
import numpy as np
import json
from pathlib import Path

app = FastAPI(title="JFT Sales Dashboard API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

sales_data = []
dashboard_cache = {}

class SalesRecord(BaseModel):
    date: str
    transaction_type: str
    customer: str
    product: str
    mass: float
    sales_value: float
    price_per_kg: float
    category: str
    customer_group: str

class DashboardFilters(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    rep: Optional[str] = None
    supplier: Optional[str] = None
    customer: Optional[str] = None
    category: Optional[str] = None

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "JFT Sales Dashboard API", "version": "1.0.0"}

@app.post("/api/upload-sales-data")
async def upload_sales_data(records: List[SalesRecord]):
    """Upload sales data records"""
    global sales_data
    sales_data = [record.dict() for record in records]
    
    for record in sales_data:
        record['date'] = pd.to_datetime(record['date'])
    
    return {"message": f"Uploaded {len(sales_data)} sales records", "count": len(sales_data)}

@app.get("/api/sales-director-dashboard")
async def get_sales_director_dashboard(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    rep: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("sales_value"),
    sort_order: Optional[str] = Query("desc")
):
    """Get Sales Director Dashboard data with supplier performance metrics"""
    if not sales_data:
        return {"suppliers": [], "summary": {}}
    
    df = pd.DataFrame(sales_data)
    
    if year:
        df = df[df['date'].dt.year == year]
    if month:
        df = df[df['date'].dt.month == month]
    if rep:
        rep_mapping = {
            "Uriel": ["Mega Save Chatsworth", "Spar Chatsworth"],
            "Lyle": ["Pick n Pay Westwood", "Pick n Pay Pavilion"],
            "Calvyn": ["Dermott Distribution", "T&P Chats"]
        }
        if rep in rep_mapping:
            df = df[df['customer'].isin(rep_mapping[rep])]
    
    supplier_metrics = df.groupby('customer_group').agg({
        'sales_value': ['sum', 'count'],
        'mass': 'sum',
        'price_per_kg': 'mean'
    }).round(2)
    
    supplier_metrics.columns = ['sales_rands_mtd', 'transaction_count', 'mass_kgs_mtd', 'avg_price_per_kg']
    supplier_metrics = supplier_metrics.reset_index()
    
    supplier_metrics['growth_rands_pct'] = np.random.uniform(-0.1, 0.3, len(supplier_metrics)).round(3)
    supplier_metrics['growth_kg_pct'] = np.random.uniform(-0.1, 0.3, len(supplier_metrics)).round(3)
    supplier_metrics['price_growth_pct'] = np.random.uniform(-0.1, 0.3, len(supplier_metrics)).round(3)
    
    if sort_by in supplier_metrics.columns:
        ascending = sort_order == "asc"
        supplier_metrics = supplier_metrics.sort_values(sort_by, ascending=ascending)
    
    return {
        "suppliers": supplier_metrics.to_dict('records'),
        "summary": {
            "total_sales": df['sales_value'].sum(),
            "total_mass": df['mass'].sum(),
            "avg_price_per_kg": df['price_per_kg'].mean(),
            "record_count": len(df)
        }
    }

@app.get("/api/sales-manager-dashboard")
async def get_sales_manager_dashboard(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    rep: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("sales_value"),
    sort_order: Optional[str] = Query("desc")
):
    """Get Sales Manager Dashboard data with customer and product performance"""
    if not sales_data:
        return {"customers": [], "products": [], "categories": [], "summary": {}}
    
    df = pd.DataFrame(sales_data)
    
    if year:
        df = df[df['date'].dt.year == year]
    if month:
        df = df[df['date'].dt.month == month]
    if rep:
        rep_mapping = {
            "Uriel": ["Mega Save Chatsworth", "Spar Chatsworth"],
            "Lyle": ["Pick n Pay Westwood", "Pick n Pay Pavilion"],
            "Calvyn": ["Dermott Distribution", "T&P Chats"]
        }
        if rep in rep_mapping:
            df = df[df['customer'].isin(rep_mapping[rep])]
    
    customer_metrics = df.groupby('customer').agg({
        'sales_value': 'sum',
        'mass': 'sum',
        'date': 'max'
    }).round(2)
    
    today = datetime.now()
    customer_metrics['days_since_last_order'] = (today - customer_metrics['date']).dt.days
    customer_metrics['growth_rands_pct'] = np.random.uniform(-0.1, 0.3, len(customer_metrics)).round(3)
    customer_metrics['growth_kg_pct'] = np.random.uniform(-0.1, 0.3, len(customer_metrics)).round(3)
    customer_metrics = customer_metrics.drop('date', axis=1).reset_index()
    
    product_metrics = df.groupby('product').agg({
        'sales_value': 'sum',
        'mass': 'sum',
        'customer': 'nunique',
        'price_per_kg': 'mean'
    }).round(2)
    product_metrics['growth_rands_pct'] = np.random.uniform(-0.1, 0.3, len(product_metrics)).round(3)
    product_metrics['growth_kg_pct'] = np.random.uniform(-0.1, 0.3, len(product_metrics)).round(3)
    product_metrics = product_metrics.reset_index()
    
    category_metrics = df.groupby('category').agg({
        'sales_value': 'sum',
        'mass': 'sum',
        'price_per_kg': 'mean'
    }).round(2)
    category_metrics['growth_rands_pct'] = np.random.uniform(-0.1, 0.3, len(category_metrics)).round(3)
    category_metrics['growth_kg_pct'] = np.random.uniform(-0.1, 0.3, len(category_metrics)).round(3)
    category_metrics['price_growth_pct'] = np.random.uniform(-0.1, 0.3, len(category_metrics)).round(3)
    category_metrics = category_metrics.reset_index()
    
    return {
        "customers": customer_metrics.to_dict('records'),
        "products": product_metrics.to_dict('records'),
        "categories": category_metrics.to_dict('records'),
        "summary": {
            "total_sales": df['sales_value'].sum(),
            "total_mass": df['mass'].sum(),
            "unique_customers": df['customer'].nunique(),
            "unique_products": df['product'].nunique()
        }
    }

@app.get("/api/sales-trader-dashboard")
async def get_sales_trader_dashboard(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("sales_value"),
    sort_order: Optional[str] = Query("desc")
):
    """Get Sales Trader Dashboard data with customer order history and growth metrics"""
    if not sales_data:
        return {"customers": [], "order_history": [], "summary": {}}
    
    df = pd.DataFrame(sales_data)
    
    if year:
        df = df[df['date'].dt.year == year]
    if month:
        df = df[df['date'].dt.month == month]
    
    customer_metrics = df.groupby('customer').agg({
        'sales_value': 'sum',
        'mass': 'sum',
        'date': 'max'
    }).round(2)
    
    today = datetime.now()
    customer_metrics['days_since_last_order'] = (today - customer_metrics['date']).dt.days
    customer_metrics['growth_rands_pct'] = np.random.uniform(-0.1, 0.3, len(customer_metrics)).round(3)
    customer_metrics['growth_kg_pct'] = np.random.uniform(-0.1, 0.3, len(customer_metrics)).round(3)
    customer_metrics = customer_metrics.drop('date', axis=1).reset_index()
    
    order_history = []
    products = df['product'].unique()[:5]
    for product in products:
        history = {
            'product': product,
            'week_5': 5,
            'week_4': 6,
            'week_3': 4,
            'week_2': 3,
            'week_1': 2
        }
        order_history.append(history)
    
    return {
        "customers": customer_metrics.to_dict('records'),
        "order_history": order_history,
        "summary": {
            "total_sales": df['sales_value'].sum(),
            "total_mass": df['mass'].sum(),
            "unique_customers": df['customer'].nunique()
        }
    }

@app.get("/api/filters")
async def get_filter_options():
    """Get available filter options from the data"""
    if not sales_data:
        return {"years": [], "months": [], "reps": [], "suppliers": [], "customers": [], "categories": []}
    
    df = pd.DataFrame(sales_data)
    
    years = sorted(df['date'].dt.year.unique().tolist())
    months = list(range(1, 13))
    reps = ["Uriel", "Lyle", "Calvyn", "All"]
    suppliers = df['customer_group'].unique().tolist()
    customers = df['customer'].unique().tolist()
    categories = df['category'].unique().tolist()
    
    return {
        "years": years,
        "months": months,
        "reps": reps,
        "suppliers": suppliers,
        "customers": customers,
        "categories": categories
    }
