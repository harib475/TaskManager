from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

class ConnectionManager:
    """
    Manages WebSocket connections for real-time task updates.
    Keeps track of active clients and handles broadcasting messages.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accepts a new WebSocket connection and adds it to active connections.
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """
        Removes a WebSocket connection when a client disconnects.
        """
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """
        Sends a message to all connected WebSocket clients.
        Used for real-time task updates (create, update, delete).
        """
        print("Broadcasting message...")
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()

@router.websocket("/ws/tasks")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for task updates.
    Keeps the connection alive and ensures the user
    receives real-time updates when tasks are created/updated/deleted.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keeps connection alive, but no direct message handling
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)