from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from datetime import datetime, timedelta
from typing import Dict, List, Any
import re

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ReportGenerator:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        
    def categorize_product(self, product_name: str) -> str:
        product_upper = product_name.upper()
        
        if any(keyword in product_upper for keyword in ['WHOLE', 'BIRD', 'NO GIB']):
            if any(keyword in product_upper for keyword in ['DELI', 'BBQ', 'GRILL']):
                return 'Deli WB'
            return 'WB'
        elif 'FILLET' in product_upper:
            return 'Fillets'
        elif any(keyword in product_upper for keyword in ['PORTION', 'DRUMSTICK', 'THIGH', 'WING']):
            return 'Portion'
        elif any(keyword in product_upper for keyword in ['CRUMB', 'MARINATED', 'BBQ', 'ESPETADA', 'GRILL']) and 'FRZ' not in product_upper:
            return 'V/Add'
        elif any(keyword in product_upper for keyword in ['CRUMB', 'MARINATED', 'BBQ', 'ESPETADA', 'GRILL']) and 'FRZ' in product_upper:
            return 'V/Add Frozen'
        elif any(keyword in product_upper for keyword in ['BACK', 'NECK', 'OFFAL', 'GIBLET']):
            return 'Offal Fresh'
        else:
            return 'Other'
    
    def categorize_customer_group(self, customer_name: str) -> str:
        customer_upper = customer_name.upper()
        
        if 'TAKE N PAY' in customer_upper or 'T&P' in customer_upper:
            return 'T&Pay'
        elif 'SPAR' in customer_upper and any(keyword in customer_upper for keyword in ['SUPER', 'DC', 'DISTRIBUTION']):
            return 'Spar D/Ship'
        elif 'HYPER' in customer_upper:
            return 'Hyper C'
        elif 'PNP' in customer_upper or 'PICK N PAY' in customer_upper:
            return 'PnP'
        elif 'MEGA' in customer_upper:
            return 'Mega'
        elif 'DERMOTT' in customer_upper:
            return 'Dermott'
        else:
            return 'Other'
    
    def calculate_period_comparison(self, current_date: datetime, days_back: int = 30):
        current_period_start = current_date - timedelta(days=days_back)
        previous_period_start = current_period_start - timedelta(days=days_back)
        previous_period_end = current_period_start
        
        current_data = self.df[
            (self.df['Date'] >= current_period_start) & 
            (self.df['Date'] <= current_date) &
            (self.df['Transaction Type'] == 'INV')
        ]
        
        previous_data = self.df[
            (self.df['Date'] >= previous_period_start) & 
            (self.df['Date'] < previous_period_end) &
            (self.df['Transaction Type'] == 'INV')
        ]
        
        return current_data, previous_data
    
    def generate_report(self, report_date: str = None) -> Dict[str, Any]:
        if report_date:
            target_date = datetime.strptime(report_date, '%Y-%m-%d')
        else:
            target_date = self.df['Date'].max()
        
        current_data, previous_data = self.calculate_period_comparison(target_date)
        
        report = {
            'date': target_date.strftime('%d %B %Y'),
            'total_sales': self.calculate_total_sales(current_data, previous_data),
            'product_categories': self.calculate_product_categories(current_data, previous_data),
            'customer_groups': self.calculate_customer_groups(current_data, previous_data),
            'top_customers': self.calculate_top_customers(current_data, previous_data),
            'product_focus_lines': self.calculate_product_focus_lines(current_data)
        }
        
        return report
    
    def calculate_total_sales(self, current_data, previous_data):
        current_mass = current_data['Mass'].sum()
        previous_mass = previous_data['Mass'].sum()
        mass_change = ((current_mass - previous_mass) / previous_mass * 100) if previous_mass > 0 else 0
        
        current_avg_price = current_data['Sales Value'].sum() / current_mass if current_mass > 0 else 0
        previous_avg_price = previous_data['Sales Value'].sum() / previous_mass if previous_mass > 0 else 0
        price_change = ((current_avg_price - previous_avg_price) / previous_avg_price * 100) if previous_avg_price > 0 else 0
        
        return {
            'mass_change': round(mass_change, 1),
            'price_per_kg': round(current_avg_price, 2),
            'price_change': round(price_change, 1)
        }
    
    def calculate_product_categories(self, current_data, previous_data):
        categories = {}
        
        current_data_copy = current_data.copy()
        previous_data_copy = previous_data.copy()
        
        current_data_copy['Category'] = current_data_copy['Product'].apply(self.categorize_product)
        previous_data_copy['Category'] = previous_data_copy['Product'].apply(self.categorize_product)
        
        current_by_category = current_data_copy.groupby('Category')['Sales Value'].sum()
        previous_by_category = previous_data_copy.groupby('Category')['Sales Value'].sum()
        
        for category in ['WB', 'Deli WB', 'Fillets', 'Portion', 'V/Add', 'V/Add Frozen', 'Offal Fresh']:
            current_val = current_by_category.get(category, 0)
            previous_val = previous_by_category.get(category, 0)
            
            if previous_val > 0:
                change = (current_val - previous_val) / previous_val * 100
            else:
                change = 0
            
            categories[category] = {
                'change': round(change, 1),
                'current_value': current_val,
                'mass': current_data_copy[current_data_copy['Category'] == category]['Mass'].sum() if category == 'V/Add Frozen' else None
            }
        
        return categories
    
    def calculate_customer_groups(self, current_data, previous_data):
        groups = {}
        
        current_data_copy = current_data.copy()
        previous_data_copy = previous_data.copy()
        
        current_data_copy['Group'] = current_data_copy['Customer'].apply(self.categorize_customer_group)
        previous_data_copy['Group'] = previous_data_copy['Customer'].apply(self.categorize_customer_group)
        
        current_by_group = current_data_copy.groupby('Group')['Sales Value'].sum()
        previous_by_group = previous_data_copy.groupby('Group')['Sales Value'].sum()
        
        for group in ['T&Pay', 'Spar D/Ship', 'Hyper C', 'PnP', 'Mega', 'Dermott']:
            current_val = current_by_group.get(group, 0)
            previous_val = previous_by_group.get(group, 0)
            
            if previous_val > 0:
                change = (current_val - previous_val) / previous_val * 100
            else:
                change = 100 if current_val > 0 else 0
            
            groups[group] = round(change, 1)
        
        return dict(sorted(groups.items(), key=lambda x: x[1], reverse=True))
    
    def calculate_top_customers(self, current_data, previous_data):
        current_by_customer = current_data.groupby('Customer')['Sales Value'].sum()
        previous_by_customer = previous_data.groupby('Customer')['Sales Value'].sum()
        
        top_customers = current_by_customer.nlargest(5)
        
        result = {}
        for customer, current_val in top_customers.items():
            previous_val = previous_by_customer.get(customer, 0)
            
            if previous_val > 0:
                change = (current_val - previous_val) / previous_val * 100
            else:
                change = 'no comp'
            
            result[customer] = change if change == 'no comp' else round(change, 1)
        
        return result
    
    def calculate_product_focus_lines(self, current_data):
        product_summary = current_data.groupby('Product').agg({
            'Mass': 'sum',
            'Customer': 'nunique'
        }).reset_index()
        
        product_summary = product_summary[product_summary['Mass'] > 0]
        top_products = product_summary.nlargest(5, 'Mass')
        
        result = {}
        for _, row in top_products.iterrows():
            mass_tons = row['Mass'] / 1000
            result[row['Product']] = {
                'mass': f"{mass_tons:.1f}t" if mass_tons >= 1 else f"{row['Mass']:.0f}kg",
                'customers': int(row['Customer'])
            }
        
        return result


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Justconnect API - Excel Report Generator"}

@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        generator = ReportGenerator(df)
        report = generator.generate_report()
        
        return {
            "status": "success",
            "filename": file.filename,
            "rows_processed": len(df),
            "report": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
