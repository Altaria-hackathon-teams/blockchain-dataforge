FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if any (standard Flask/web3 doesn't need much)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

COPY . .

# Expose port 8000
EXPOSE 8000

# Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "main:app"]
