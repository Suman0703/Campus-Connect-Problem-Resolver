export default function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Join user-specific and role-specific rooms upon authentication
    socket.on('setup_user', ({ userId, role }) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined personal room: user:${userId}`);
      }

      // Admins and SuperAdmins join the general admin notification room
      if (role === 'admin' || role === 'superadmin') {
        socket.join('admins');
        console.log(`Socket ${socket.id} joined room: admins`);
      }
    });

    // Handle manual disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}