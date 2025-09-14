from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - uses SQLite by default, can be overridden with env var
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task.db")

# Create SQLAlchemy engine (manages DB connection pool)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # required only for SQLite
)

# Session factory (creates DB sessions for each request)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models (all models will inherit from this)
Base = declarative_base()


def get_db():
    """
    Dependency for FastAPI routes.
    
    Creates a new database session, yields it for use in the request,
    and ensures it is closed after the request is finished.

    Usage:
        db: Session = Depends(get_db)

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()