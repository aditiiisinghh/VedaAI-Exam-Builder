import cors from "cors";
import express from "express";
import http from "http";
import { env } from "./config/env.js";
import { connectMongo } from "./config/db.js";
import { assignmentsRouter } from "./routes/assignments.js";
import { attachSocketServer } from "./sockets/hub.js";
import { startGenerationWorker } from "./workers/generation.worker.js";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vedaai-api" });
});

app.use("/api/assignments", assignmentsRouter);
attachSocketServer(server);

async function bootstrap() {
  await connectMongo();
  await startGenerationWorker();

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
