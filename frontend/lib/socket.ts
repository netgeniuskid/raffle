import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from './api'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export const connectSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (socket?.connected) {
    return socket
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  socket = io(API_URL, {
    auth: {
      token,
    },
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  return socket
}











