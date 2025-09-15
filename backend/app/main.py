from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import db, models, auth, tasks, ws
import uvicorn
from fastapi.openapi.utils import get_openapi

# ✅ Create database tables from models (only runs once at startup)
models.Base.metadata.create_all(bind=db.engine)

# ✅ Initialize FastAPI app
app = FastAPI(
    title="Task Management API",
    description="Backend for Task Management App built with FastAPI",
    version="1.0.0",
)
# Allow CORS for frontend during development
origins = [
    "https://task-manager-neon-phi.vercel.app/login",
]

# ✅ Middleware: CORS (Cross-Origin Resource Sharing)
# This allows frontend (React, etc.) to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ⚠️ In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def custom_openapi():
    """
    Customizes the OpenAPI schema for the Task Management API.

    - Sets API title, version, and description
    - Adds JWT BearerAuth security scheme
    - Applies security requirement globally (except `/auth` routes)

    Returns:
        dict: Customized OpenAPI schema
    """
    if app.openapi_schema:
        return app.openapi_schema

    # Generate base schema
    openapi_schema = get_openapi(
        title="Task Management API",
        version="1.0.0",
        description="FastAPI backend for Task Management App",
        routes=app.routes,
    )

    # ✅ Add BearerAuth scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # ✅ Apply BearerAuth to all endpoints except /auth
    for path, methods in openapi_schema["paths"].items():
        if not path.startswith("/auth"):
            for method in methods.values():
                method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Override default OpenAPI generator
app.openapi = custom_openapi


# ✅ Register API routers
app.include_router(auth.router)   # Authentication routes (/auth)
app.include_router(tasks.router)  # Task management routes (/tasks)
app.include_router(ws.router)     # WebSocket routes (/ws)


if __name__ == "__main__":
    # ✅ Run app with Uvicorn (development mode, reload enabled)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)