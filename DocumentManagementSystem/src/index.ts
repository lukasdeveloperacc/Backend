import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

import contactsRouter from "./routes/contacts";
import documentsRouter from "./routes/documents";
import googleAuthRouter from "./routes/auth/google";

const app = express();
const port = 80;

app.use(morgan("dev"));
app.use(express.json());
app.use("/auth/google", googleAuthRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/documents", documentsRouter);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
