import sys
print(f"Executable: {sys.executable}")
print(f"Path: {sys.path}")
try:
    import fastapi
    print(f"FastAPI: {fastapi.__file__}")
except ImportError as e:
    print(f"Error: {e}")
