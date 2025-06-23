from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from datetime import datetime, timedelta
from typing import Dict, List, Any
import re
from pydantic import BaseModel
import requests
import json

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class SMSConfig(BaseModel):
    provider: str
    apiKey: str
    fromNumber: str
    recipients: List[str]

class SMSRequest(BaseModel):
    report: Dict[str, Any]
    sms_config: SMSConfig
    report_mode: str

class ReportGenerator:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        
    def categorize_product(self, product_name: str) -> str:
        product_upper = product_name.upper()
        
        if any(keyword in product_upper for keyword in ['NO GIB', 'WHOLE BIRD', 'WHOLE']):
            if any(keyword in product_upper for keyword in ['SMOKED', 'BBQ', 'DELI', 'GRILL']):
                return 'Deli WB'
            return 'WB'
        elif 'BREAST' in product_upper and any(keyword in product_upper for keyword in ['SMOKED', 'BBQ', 'DELI']):
            return 'Deli WB'
        elif any(keyword in product_upper for keyword in ['BREAST', 'FILLET']):
            return 'Fillets'
        elif any(keyword in product_upper for keyword in ['DRUMSTICK', 'THIGH', 'WING', 'STAR PACK']):
            return 'Portion'
        elif any(keyword in product_upper for keyword in ['FROZEN', 'IQF']) or '(FRZ)' in product_upper or 'FRZ' in product_upper:
            return 'V/Add Frozen'
        elif any(keyword in product_upper for keyword in ['SCHNITZEL', 'CRUMB', 'MARINATED', 'ESPETADA', 'GRILL', 'RUSSIAN', 'KIEV']):
            return 'V/Add'
        elif any(keyword in product_upper for keyword in ['GIZZARD', 'HEART', 'LIVER', 'NECK', 'SOUP PACK', 'OFFAL', 'GIBLET']):
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
            target_date = self.df['Date'].max()
        
        daily_data = self.get_daily_data(target_date)
        
        if len(daily_data) == 0:
            raise ValueError(f"No invoice data found for date {target_date.date()}")
        
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
            if category in by_category.index:
                sales_value = by_category.loc[category, 'Sales Value']
                mass = by_category.loc[category, 'Mass']
            else:
                sales_value = 0
                mass = 0
            
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
    
    def get_period_data(self, start_date: datetime, end_date: datetime):
        """Get data for a specific date range"""
        period_data = self.df[
            (self.df['Date'].dt.date >= start_date.date()) &
            (self.df['Date'].dt.date <= end_date.date()) &
            (self.df['Transaction Type'] == 'INV')
        ]
        return period_data
    
    def calculate_comparison_metrics(self, current_data, previous_data, metric_name: str):
        """Calculate percentage change and totals for comparison"""
        current_total = current_data[metric_name].sum() if len(current_data) > 0 else 0
        previous_total = previous_data[metric_name].sum() if len(previous_data) > 0 else 0
        
        if previous_total == 0:
            percentage_change = "no comp" if current_total > 0 else "0%"
        else:
            percentage_change = f"{((current_total - previous_total) / previous_total) * 100:.1f}%"
        
        return {
            'percentage_change': percentage_change,
            'current_total': round(current_total, 2),
            'previous_total': round(previous_total, 2)
        }
    
    def generate_comparison_report(self, period: str = "daily", report_date: str = None) -> Dict[str, Any]:
        """Generate report with comparison analytics"""
        if report_date:
            target_date = datetime.strptime(report_date, '%Y-%m-%d')
        else:
            target_date = self.df['Date'].max()
        
        if period == "daily":
            current_data = self.get_daily_data(target_date)
            previous_data = self.get_daily_data(target_date - timedelta(days=1))
            period_name = "Today vs Yesterday"
        elif period == "weekly":
            current_week_start = target_date - timedelta(days=target_date.weekday())
            current_week_end = current_week_start + timedelta(days=6)
            current_data = self.get_period_data(current_week_start, current_week_end)
            
            previous_week_start = current_week_start - timedelta(days=7)
            previous_week_end = previous_week_start + timedelta(days=6)
            previous_data = self.get_period_data(previous_week_start, previous_week_end)
            period_name = "This Week vs Last Week"
        elif period == "monthly":
            current_month_start = target_date.replace(day=1)
            current_data = self.get_period_data(current_month_start, target_date)
            
            if current_month_start.month == 1:
                previous_month_start = current_month_start.replace(year=current_month_start.year-1, month=12)
            else:
                previous_month_start = current_month_start.replace(month=current_month_start.month-1)
            
            days_in_current = (target_date - current_month_start).days + 1
            previous_month_end = previous_month_start + timedelta(days=days_in_current-1)
            previous_data = self.get_period_data(previous_month_start, previous_month_end)
            period_name = "This Month vs Last Month"
        
        comparison = self.generate_period_comparison(current_data, previous_data, period_name)
        
        return {
            'date': target_date.strftime('%d %B %Y'),
            'period': period,
            'comparison': comparison
        }
    
    def generate_period_comparison(self, current_data, previous_data, period_name: str):
        """Generate comprehensive comparison for a period"""
        mass_comparison = self.calculate_comparison_metrics(current_data, previous_data, 'Mass')
        sales_comparison = self.calculate_comparison_metrics(current_data, previous_data, 'Sales Value')
        
        current_mass = current_data['Mass'].sum() if len(current_data) > 0 else 0
        current_sales = current_data['Sales Value'].sum() if len(current_data) > 0 else 0
        previous_mass = previous_data['Mass'].sum() if len(previous_data) > 0 else 0
        previous_sales = previous_data['Sales Value'].sum() if len(previous_data) > 0 else 0
        
        current_price_per_kg = current_sales / current_mass if current_mass > 0 else 0
        previous_price_per_kg = previous_sales / previous_mass if previous_mass > 0 else 0
        
        if previous_price_per_kg == 0:
            price_change = "no comp" if current_price_per_kg > 0 else "0%"
        else:
            price_change = f"{((current_price_per_kg - previous_price_per_kg) / previous_price_per_kg) * 100:.1f}%"
        
        current_categories = self.calculate_daily_product_categories(current_data)
        previous_categories = self.calculate_daily_product_categories(previous_data)
        
        category_comparisons = {}
        for category in ['WB', 'Deli WB', 'Fillets', 'Portion', 'V/Add', 'V/Add Frozen', 'Offal Fresh']:
            current_sales = current_categories[category]['sales_value']
            previous_sales = previous_categories[category]['sales_value']
            
            if previous_sales == 0:
                percentage = "no comp" if current_sales > 0 else "0%"
            else:
                percentage = f"{((current_sales - previous_sales) / previous_sales) * 100:.1f}%"
            
            category_comparisons[category] = {
                'percentage_change': percentage,
                'current_total': current_sales,
                'previous_total': previous_sales
            }
        
        current_groups = self.calculate_daily_customer_groups(current_data)
        previous_groups = self.calculate_daily_customer_groups(previous_data)
        
        group_comparisons = {}
        for group in ['T&Pay', 'Spar D/Ship', 'Hyper C', 'PnP', 'Mega', 'Dermott']:
            current_sales = current_groups.get(group, 0)
            previous_sales = previous_groups.get(group, 0)
            
            if previous_sales == 0:
                percentage = "no comp" if current_sales > 0 else "0%"
            else:
                percentage = f"{((current_sales - previous_sales) / previous_sales) * 100:.1f}%"
            
            group_comparisons[group] = {
                'percentage_change': percentage,
                'current_total': current_sales,
                'previous_total': previous_sales
            }
        
        return {
            'period_name': period_name,
            'total_sales': {
                'mass': f"{mass_comparison['percentage_change']} ({mass_comparison['current_total']:.1f}kg)",
                'price_per_kg': f"{price_change} (R{current_price_per_kg:.2f})"
            },
            'product_categories': category_comparisons,
            'customer_groups': group_comparisons
        }


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Justconnect API - Excel Report Generator"}

@app.post("/upload-excel")
async def upload_excel(
    file: UploadFile = File(...), 
    comparison_mode: bool = False,
    period: str = "daily"
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        generator = ReportGenerator(df)
        
        if comparison_mode:
            report = generator.generate_comparison_report(period=period)
        else:
            report = generator.generate_report()
        
        return {
            "status": "success",
            "filename": file.filename,
            "rows_processed": len(df),
            "report": report,
            "comparison_mode": comparison_mode,
            "period": period if comparison_mode else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

def format_report_for_sms(report: Dict[str, Any], mode: str) -> str:
    """Format report data for SMS message"""
    if mode == "compare":
        comparison = report['comparison']
        message = f"URIEL Riversmead Sales - {report['date']}\n"
        message += f"{comparison['period_name']}\n\n"
        message += f"Total Sales:\n"
        message += f"Mass: {comparison['total_sales']['mass']}\n"
        message += f"P/Kg: {comparison['total_sales']['price_per_kg']}\n\n"
        message += f"Product Categories:\n"
        for category, values in comparison['product_categories'].items():
            message += f"{category}: {values['percentage_change']}\n"
        message += f"\nCustomer Groups:\n"
        for group, values in comparison['customer_groups'].items():
            message += f"{group}: {values['percentage_change']}\n"
    else:
        message = f"URIEL Riversmead Sales - {report['date']}\n\n"
        message += f"Total Sales:\n"
        message += f"Mass: {report['total_sales']['total_mass']:.1f}kg\n"
        message += f"Value: R{report['total_sales']['total_sales_value']:.2f}\n"
        message += f"Price/Kg: R{report['total_sales']['price_per_kg']:.2f}\n\n"
        message += f"Top Categories:\n"
        for category, values in list(report['product_categories'].items())[:3]:
            message += f"{category}: R{values['sales_value']:.2f}\n"
    
    return message

async def send_sms_twilio(message: str, config: SMSConfig):
    """Send SMS using Twilio API"""
    url = f"https://api.twilio.com/2010-04-01/Accounts/{config.apiKey.split(':')[0]}/Messages.json"
    
    for recipient in config.recipients:
        data = {
            'From': config.fromNumber,
            'To': recipient,
            'Body': message
        }
        
        auth = tuple(config.apiKey.split(':'))
        response = requests.post(url, data=data, auth=auth)
        
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"Failed to send SMS to {recipient}")

async def send_sms_aws_sns(message: str, config: SMSConfig):
    """Send SMS using AWS SNS"""
    import boto3
    
    access_key, secret_key = config.apiKey.split(':')
    
    sns = boto3.client(
        'sns',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='us-east-1'  # Default region
    )
    
    for recipient in config.recipients:
        sns.publish(
            PhoneNumber=recipient,
            Message=message
        )

async def send_sms_generic(message: str, config: SMSConfig):
    """Generic SMS sending for other providers"""
    provider_urls = {
        'clickatell': 'https://platform.clickatell.com/messages/http/send',
        'messagebird': 'https://rest.messagebird.com/messages',
        'nexmo': 'https://rest.nexmo.com/sms/json'
    }
    
    if config.provider not in provider_urls:
        raise HTTPException(status_code=400, detail=f"Unsupported SMS provider: {config.provider}")
    
    headers = {'Authorization': f'Bearer {config.apiKey}'}
    
    for recipient in config.recipients:
        data = {
            'from': config.fromNumber,
            'to': recipient,
            'text': message
        }
        
        response = requests.post(provider_urls[config.provider], json=data, headers=headers)
        
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail=f"Failed to send SMS to {recipient}")

@app.post("/send-sms")
async def send_sms(request: SMSRequest):
    """Send SMS notifications with report data"""
    try:
        message = format_report_for_sms(request.report, request.report_mode)
        
        if request.sms_config.provider == "twilio":
            await send_sms_twilio(message, request.sms_config)
        elif request.sms_config.provider == "aws_sns":
            await send_sms_aws_sns(message, request.sms_config)
        else:
            await send_sms_generic(message, request.sms_config)
        
        return {
            "status": "success",
            "message": "SMS sent successfully",
            "recipients_count": len(request.sms_config.recipients)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending SMS: {str(e)}")
