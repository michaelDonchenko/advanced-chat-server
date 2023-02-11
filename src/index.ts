import http from "http";
import express from "express";
import cors from "cors";
import {Server} from "socket.io";
import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";

dotenv.config();

// routes
import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contact";
import conversationRoutes from "./routes/conversation";
import WebSocket from "./controllers/socket";

const app = express();
const port = process.env.PORT || "5000";
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/api", [authRoutes, contactRoutes, conversationRoutes]);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const webSocket = new WebSocket(socket, prisma);
  const myId = socket.handshake.query.userId;
  webSocket.connection(myId);

  socket.on("login", (userId: string) => webSocket.login(userId));
  socket.on("logout", (userId: string) => webSocket.logout(userId));
  socket.on("message", ({message, conversation, myUserId}) =>
    webSocket.message(message, conversation, myUserId)
  );
  socket.on("disconnect", (reason) => webSocket.disconnect(reason, myId));
  socket.on("conversationChange", ({conversationId, myUserId}) =>
    webSocket.conversationChange(conversationId, myUserId)
  );
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
