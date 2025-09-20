FROM python:3.9-alpine

WORKDIR /app

# Install build dependencies for psutil
RUN apk add --no-cache gcc musl-dev linux-headers

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

CMD ["python", "app.py"]