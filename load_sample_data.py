import pandas as pd
import requests
import json
from datetime import datetime

def load_sample_data():
    """Load sample sales data and upload to the backend API"""
    
    df = pd.read_excel('/home/ubuntu/attachments/7655e99c-1f7c-489f-9da1-2193cf67b2b3/sample_sales_data_2months.xlsx')
    
    records = []
    for _, row in df.iterrows():
        record = {
            "date": row['Date'].strftime('%Y-%m-%d') if pd.notna(row['Date']) else '',
            "transaction_type": str(row['Transaction Type']) if pd.notna(row['Transaction Type']) else '',
            "customer": str(row['Customer']) if pd.notna(row['Customer']) else '',
            "product": str(row['Product']) if pd.notna(row['Product']) else '',
            "mass": float(row['Mass']) if pd.notna(row['Mass']) else 0.0,
            "sales_value": float(row['Sales Value']) if pd.notna(row['Sales Value']) else 0.0,
            "price_per_kg": float(row['Price per Kg']) if pd.notna(row['Price per Kg']) else 0.0,
            "category": str(row['Category']) if pd.notna(row['Category']) else '',
            "customer_group": str(row['Customer Group']) if pd.notna(row['Customer Group']) else ''
        }
        records.append(record)
    
    print(f"Prepared {len(records)} records for upload")
    
    try:
        response = requests.post(
            'https://app-jyewtqju.fly.dev/api/upload-sales-data',
            json=records,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Successfully uploaded data: {result}")
        else:
            print(f"Failed to upload data. Status: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading data: {e}")

if __name__ == "__main__":
    load_sample_data()
