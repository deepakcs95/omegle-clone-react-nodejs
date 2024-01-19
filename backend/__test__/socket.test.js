import { io as ioc } from "socket.io-client";

describe("my awesome project", () => {
  let serverSocket, user1, user2;

  beforeAll((done) => {
    user1 = ioc(`http://localhost:3000`);
    user2 = ioc(`http://localhost:3000`);
    done();
  });

  afterAll(() => {
    user2.disconnect();
    user1.disconnect();
  });

  test("user1 connection", (done) => {
    user1.on("send-offer", (arg) => {
      console.log("room id is ", arg);
      expect(arg).toBeDefined();
      done();
    });
    user1.emit("test");
    user2.emit("test");
  });
});
