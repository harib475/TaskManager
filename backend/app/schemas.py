from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ----- AUTH -----
class UserCreate(BaseModel):
    """
    Schema for user registration request.
    Contains user email, password, and name.
    """
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """
    Schema for user login request.
    Requires only email and password.
    """
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """
    Schema for sending user details in response.
    Includes id, email, name, and created_at.
    """
    id: int
    email: EmailStr
    name: str
    created_at: datetime

    class Config:
        orm_mode = True  # Allows compatibility with SQLAlchemy ORM objects


# ----- TASKS -----
class TaskBase(BaseModel):
    """
    Base schema for tasks.
    Defines common fields like title, description, category, and completed status.
    """
    title: str
    description: Optional[str] = None
    category: Optional[str] = "General"
    completed: Optional[bool] = False


class TaskCreate(TaskBase):
    """
    Schema for creating a new task.
    Inherits all fields from TaskBase.
    """
    pass


class TaskUpdate(TaskBase):
    """
    Schema for updating an existing task.
    Inherits all fields from TaskBase.
    All fields are optional for partial update.
    """
    pass


class TaskOut(TaskBase):
    """
    Schema for returning task details in response.
    Includes id, created_at, and updated_at along with base fields.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # Ensures Pydantic works with ORM attributes