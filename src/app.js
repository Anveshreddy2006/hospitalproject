import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import patientRoutes from "./routes/patient.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(express.json());
app.use(cookieParser());

// static hosting for uploaded reports
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// api routes
app.use("/api/v1/patient", patientRoutes);

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));
