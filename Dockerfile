FROM python:3.14-slim

WORKDIR /app/backend

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY data/ /app/data/

ENV PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]