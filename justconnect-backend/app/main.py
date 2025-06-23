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
        
        if any(keyword in product_upper for keyword in ['NO GIB', 'WHOLE BIRD', 'WHOLE']):
            if any(keyword in product_upper for keyword in ['DELI', 'BBQ', 'SMOKED', 'GRILL', 'MARINATED']):
                return 'Deli WB'
            return 'WB'
        elif any(keyword in product_upper for keyword in ['BREAST', 'FILLET']):
            return 'Fillets'
        elif any(keyword in product_upper for keyword in ['DRUMSTICK', 'THIGH', 'WING', 'PORTION']):
            return 'Portion'
        elif any(keyword in product_upper for keyword in ['FRZ', 'FROZEN', 'IQF']) or '(FRZ)' in product_upper:
            return 'V/Add Frozen'
        elif any(keyword in product_upper for keyword in ['CRUMB', 'MARINATED', 'BBQ', 'ESPETADA', 'GRILL', 'RUSSIAN', 'KIEV']):
            return 'V/Add'
        elif any(keyword in product_upper for keyword in ['BACK', 'NECK', 'OFFAL', 'GIBLET', 'SOUP', 'PACK']):
            return 'Offal Fresh'
        else:
            return 'WB'  # Default to WB for unmatched chicken products
    
    def categorize_customer_group(self, customer_name: str) -> str:
        customer_upper = customer_name.upper()
        
        if 'TAKE N PAY' in customer_upper or 'T&P' in customer_upper:
            return 'T&Pay'
        elif 'SPAR' in customer_upper:
            return 'Spar D/Ship'
        elif 'HYPER' in customer_upper:
            return 'Hyper C'
        elif "PICK 'N PAY" in customer_upper or 'PNP' in customer_upper or 'PICK N PAY' in customer_upper:
            return 'PnP'
        elif 'MEGA' in customer_upper:
            return 'Mega'
        elif 'DERMOTT' in customer_upper:
            return 'Dermott'
        else:
            return 'Other'
    
    def get_daily_data(self, target_date: datetime):
        daily_data = self.df[
            (self.df['Date'].dt.date == target_date.date()) &
            (self.df['Transaction Type'] == 'INV')
        ]
        return daily_data
    
    def generate_report(self, report_date: str = None) -> Dict[str, Any]:
        if report_date:
            target_date = datetime.strptime(report_date, '%Y-%m-%d')
        else:
            target_date = datetime(2025, 5, 17)
        
        daily_data = self.get_daily_data(target_date)
        
        if len(daily_data) == 0:
            target_date = self.df['Date'].max()
            daily_data = self.get_daily_data(target_date)
        
        report = {
            'date': target_date.strftime('%d %B %Y'),
            'total_sales': self.calculate_daily_sales(daily_data),
            'product_categories': self.calculate_daily_product_categories(daily_data),
            'customer_groups': self.calculate_daily_customer_groups(daily_data),
            'top_customers': self.calculate_daily_top_customers(daily_data),
            'product_focus_lines': self.calculate_product_focus_lines(daily_data)
        }
        
        return report
    
    def calculate_daily_sales(self, daily_data):
        total_mass = daily_data['Mass'].sum()
        total_sales_value = daily_data['Sales Value'].sum()
        avg_price_per_kg = total_sales_value / total_mass if total_mass > 0 else 0
        
        return {
            'total_mass': round(total_mass, 1),
            'total_sales_value': round(total_sales_value, 2),
            'price_per_kg': round(avg_price_per_kg, 2),
            'total_orders': len(daily_data)
        }
    
    def calculate_daily_product_categories(self, daily_data):
        categories = {}
        
        daily_data_copy = daily_data.copy()
        daily_data_copy['Category'] = daily_data_copy['Product'].apply(self.categorize_product)
        
        by_category = daily_data_copy.groupby('Category').agg({
            'Sales Value': 'sum',
            'Mass': 'sum'
        })
        
        for category in ['WB', 'Deli WB', 'Fillets', 'Portion', 'V/Add', 'V/Add Frozen', 'Offal Fresh']:
            sales_value = by_category.get(category, {}).get('Sales Value', 0) if category in by_category.index else 0
            mass = by_category.get(category, {}).get('Mass', 0) if category in by_category.index else 0
            
            categories[category] = {
                'sales_value': round(sales_value, 2),
                'mass': round(mass, 1),
                'mass_tons': round(mass / 1000, 1) if category == 'V/Add Frozen' else None
            }
        
        return categories
    
    def calculate_daily_customer_groups(self, daily_data):
        groups = {}
        
        daily_data_copy = daily_data.copy()
        daily_data_copy['Group'] = daily_data_copy['Customer'].apply(self.categorize_customer_group)
        
        by_group = daily_data_copy.groupby('Group')['Sales Value'].sum()
        
        for group in ['T&Pay', 'Spar D/Ship', 'Hyper C', 'PnP', 'Mega', 'Dermott']:
            sales_value = by_group.get(group, 0)
            groups[group] = round(sales_value, 2)
        
        return dict(sorted(groups.items(), key=lambda x: x[1], reverse=True))
    
    def calculate_daily_top_customers(self, daily_data):
        by_customer = daily_data.groupby('Customer')['Sales Value'].sum()
        top_customers = by_customer.nlargest(5)
        
        result = {}
        for customer, sales_value in top_customers.items():
            result[customer] = round(sales_value, 2)
        
        return result
    
    def calculate_product_focus_lines(self, daily_data):
        product_summary = daily_data.groupby('Product').agg({
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
