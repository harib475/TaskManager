from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .db import Base


class User(Base):
    """
    Database model for users.

    Attributes:
        id (int): Primary key for the user.
        email (str): Unique email of the user (used for login).
        hashed_password (str): Securely hashed password.
        name (str): Full name of the user.
        created_at (datetime): Timestamp when the user was created.
        tasks (relationship): One-to-many relationship with Task model.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One user -> many tasks
    tasks = relationship("Task", back_populates="owner")


class Task(Base):
    """
    Database model for tasks.

    Attributes:
        id (int): Primary key for the task.
        title (str): Title of the task.
        description (str): Optional detailed description of the task.
        category (str): Category of the task (default = 'General').
        completed (bool): Task status (True = completed, False = incomplete).
        created_at (datetime): Timestamp when the task was created.
        updated_at (datetime): Timestamp when the task was last updated.
        user_id (int): Foreign key linking to the User model.
        owner (relationship): Reference back to the owning User.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, default="General")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Many tasks -> one user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    owner = relationship("User", back_populates="tasks")