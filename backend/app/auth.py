from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from . import schemas, models, db

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecret"  # ⬅️ Replace with env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def get_password_hash(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        password (str): The plain text password to be hashed.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plain password matches the hashed password.

    Args:
        plain_password (str): The password entered by the user.
        hashed_password (str): The stored hashed password.

    Returns:
        bool: True if match, otherwise False.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Generate a JWT access token.

    Args:
        data (dict): The payload data (e.g., user email).
        expires_delta (timedelta, optional): Token expiration time. Defaults to 15 mins.

    Returns:
        str: Encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str, db: Session):
    """
    Validate the JWT token and fetch the current user.

    Args:
        token (str): JWT access token from request.
        db (Session): Database session dependency.

    Raises:
        HTTPException: If the token is invalid or user is not found.

    Returns:
        models.User: The authenticated user object.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(db.get_db)):
    """
    Register a new user.

    Args:
        user (schemas.UserCreate): User data including name, email, password.
        db (Session): Database session dependency.

    Raises:
        HTTPException: If email already exists.

    Returns:
        models.User: The newly created user object.
    """
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_pw, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(db.get_db)):
    """
    Authenticate user and generate access token.

    Args:
        user (schemas.UserLogin): Login credentials (email & password).
        db (Session): Database session dependency.

    Raises:
        HTTPException: If credentials are invalid.

    Returns:
        dict: JWT access token, current user ID, and token type.
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "current_user": db_user.id, "token_type": "bearer"}