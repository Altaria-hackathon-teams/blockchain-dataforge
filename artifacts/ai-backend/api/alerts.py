from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # If the backend receives a notification, it broadcasts it.
            # In a real app, the backend might listen to Blockchain events and push them here.
            try:
                msg = json.loads(data)
                # Example: {"type": "NEW_BATCH", "batchId": "BATCH-123"}
                await manager.broadcast(json.dumps(msg))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
