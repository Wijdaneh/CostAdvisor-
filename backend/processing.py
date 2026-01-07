import pandas as pd
from fastapi import HTTPException
import io

REQUIRED_COLUMNS = ["service", "month", "budget", "real", "type"]

def validate_and_process_file(file_content: bytes, filename: str) -> pd.DataFrame:
    """
    Reads a CSV or Excel file bytes, checks for required columns, and performs basic cleaning.
    Returns a pandas DataFrame.
    """
    try:
        if filename.lower().endswith(".csv"):
            # Try to read with default separator first, then fallback to semicolon if needed
            # Or use python engine with automatic separator detection (sometimes slower/buggy)
            # Better approach: Read first line to detect separator
            content_str = file_content.decode('utf-8', errors='replace')
            if ";" in content_str.split('\n')[0]:
                df = pd.read_csv(io.StringIO(content_str), sep=';')
            else:
                df = pd.read_csv(io.StringIO(content_str))
        elif filename.lower().endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")

        # Normalize headers to lowercase for loosely checking
        # Store original columns map if we want to return original names, but standardized is easier
        df.columns = df.columns.astype(str).str.lower().str.strip()
        
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing)}")
            
        # Basic cleaning: Ensure numbers are numbers
        for col in ['budget', 'real']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Calculate Variance (Real - Budget). Positive means over budget (bad for loose costs, depends on context)
        # But usually in management control: Variance = Real - Budget. 
        # If Real > Budget -> Negative impact (Overspending).
        df['variance'] = df['real'] - df['budget']
        
        return df
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        # Log the error here in a real app
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
