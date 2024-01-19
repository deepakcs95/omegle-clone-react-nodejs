export class UserManager {
  constructor() {
    this.users = [];
    this.queue = [];
  }

  addUser(name, socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
  }
}
