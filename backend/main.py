from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import feature module
from feature.relationship_suggest import router as relationship_router

app = FastAPI()

# CORS để Vite gọi về backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(relationship_router)

@app.post('/enhance_photo')
async def enhance_photo(request: Request):
    data = await request.json() if request.headers.get('content-type', '').startswith('application/json') else {}
    filename = data.get('filename')
    return JSONResponse({
        'status': 'success',
        'endpoint': 'enhance_photo',
        'filename': filename
    })

@app.post('/notification')
async def notification(request: Request):
    data = await request.json() if request.headers.get('content-type', '').startswith('application/json') else {}
    return JSONResponse({
        'status': 'success',
        'endpoint': 'notification',
        'notification': data
    })

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)