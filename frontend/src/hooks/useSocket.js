import { useEffect, useRef, useState } from 'react'

export default function useSocket(token, onMessage) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const url = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8000/ws/tasks'
    const ws = new WebSocket(url)
    socketRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      console.log('✅ WebSocket connected')
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('❌ WebSocket disconnected')
    }

    ws.onerror = (err) => {
      console.error('⚠️ WebSocket error', err)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📩 WS message:', data)

        if (onMessage) onMessage(data)

      } catch (e) {
        console.error('Invalid WS message', e)
      }
    }

    return () => ws.close()
  }, [onMessage, token])

  return { socket: socketRef.current, connected }
}