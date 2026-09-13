from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, marketplace, recycle, help, users

app = FastAPI(
    title="NeighbourLoop API",
    description="Backend API for NeighbourLoop FYP Community Platform (FastAPI)",
    version="1.0.0"
)

# Enable CORS for React Native / Expo Go development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sub-routers
app.include_router(auth.router)
app.include_router(marketplace.router)
app.include_router(recycle.router)
app.include_router(help.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "NeighbourLoop API",
        "version": "1.0.0",
        "description": "Platform Komuniti Lestari (Help Nearby, Marketplace, Smart Recycling & Donation)"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

