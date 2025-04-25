import { Server } from '@hocuspocus/server';

// Start service to enable collaboration
const server = Server.configure({
  port: 3123,
  host: '0.0.0.0', // Allow access from any device on the network
});

server.listen();