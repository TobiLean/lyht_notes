import { Server } from '@hocuspocus/server'

// Start service to enable collaboration
const server = Server.configure({
  port: 3123
})
server.listen();