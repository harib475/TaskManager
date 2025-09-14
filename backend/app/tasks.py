from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from . import schemas, models, db, auth
from app.ws import manager 
import asyncio

router = APIRouter(prefix="/tasks", tags=["Tasks"])

def get_token_header(authorization: str = Header(...)):
    """
    Extracts the JWT token from the Authorization header.
    Expected format: 'Bearer <token>'
    """
    return authorization.split(" ")[1]


@router.get("/", response_model=List[schemas.TaskOut])
def get_tasks(
    token: str = Depends(get_token_header), 
    db: Session = Depends(db.get_db),
    search: Optional[str] = Query(None, description="Search in task title or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status: all | complete | incomplete")
):
    """
    Retrieve a list of tasks for the authenticated user.
    
    - **search**: Filter tasks by keyword in title/description  
    - **category**: Filter tasks by category  
    - **status**: Filter tasks by completion status (all | complete | incomplete)
    """
    query = db.query(models.Task)

    if search:
        query = query.filter(
            (models.Task.title.ilike(f"%{search}%")) |
            (models.Task.description.ilike(f"%{search}%"))
        )

    if category:
        query = query.filter(models.Task.category == category)

    if status and status.lower() != "all":
        if status.lower() == "complete":
            query = query.filter(models.Task.completed == True)
        elif status.lower() == "incomplete":
            query = query.filter(models.Task.completed == False)

    return query.all()


@router.post("/", response_model=schemas.TaskOut)
async def create_task(
    task: schemas.TaskCreate, 
    token: str = Depends(get_token_header), 
    db: Session = Depends(db.get_db)
):
    """
    Create a new task for the authenticated user.
    Broadcasts a `task_created` event to WebSocket clients.
    """
    user = auth.get_current_user(token, db)
    new_task = models.Task(**task.dict(), user_id=user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    await asyncio.create_task(manager.broadcast({
        "event": "task_created",
        "user_id": user.id,
        "task": schemas.TaskOut.from_orm(new_task).model_dump(mode="json")
    }))
    
    return new_task


@router.put("/{task_id}", response_model=schemas.TaskOut)
async def update_task(
    task_id: int, 
    task: schemas.TaskUpdate, 
    token: str = Depends(get_token_header), 
    db: Session = Depends(db.get_db)
):
    """
    Update an existing task by its ID.
    Broadcasts a `task_updated` event to WebSocket clients.
    """
    user = auth.get_current_user(token, db)
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    
    await asyncio.create_task(manager.broadcast({
        "event": "task_updated",
        "user_id": user.id,
        "task": schemas.TaskOut.from_orm(db_task).model_dump(mode="json")
    }))
    return db_task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int, 
    token: str = Depends(get_token_header), 
    db: Session = Depends(db.get_db)
):
    """
    Delete an existing task by its ID.
    Broadcasts a `task_deleted` event to WebSocket clients.
    """
    user = auth.get_current_user(token, db)
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()

    await asyncio.create_task(manager.broadcast({
        "event": "task_deleted",
        "user_id": user.id,
        "task_id": task_id
    }))
    return {"detail": "Task deleted"}