# myPCOS Setup Notes

## Current scaffold

- `frontend/`: Next.js application
- `backend/`: FastAPI application
- `models/weights/`: YOLO model files such as `best.pt`
- `docs/`: project setup and architecture notes

## First backend run

1. `cd backend`
2. `source venv/bin/activate`
3. `cp .env.example .env`
4. `uvicorn app.main:app --reload`

## First API checks

- Root endpoint: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`
