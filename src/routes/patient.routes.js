import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { verifyJWT } from "../middlewares/auth.js";
import {
  upsertMyProfile,
  getMyProfile,
  patchMyProfile,
  uploadReport,
  listMyReports,
  bookAppointment,
  listMyAppointments,
  cancelAppointment,
} from "../controllers/patient.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer disk storage (local). Later you can swap this for Cloudinary/S3
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/uploads"),
  filename: (_req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safe);
  },
});
const upload = multer({ storage });

const router = Router();

// profile
router.post("/me/profile", verifyJWT, upsertMyProfile);
router.get("/me/profile", verifyJWT, getMyProfile);
router.patch("/me/profile", verifyJWT, patchMyProfile);

// reports
router.post("/me/reports", verifyJWT, upload.single("report"), uploadReport);
router.get("/me/reports", verifyJWT, listMyReports);

// appointments
router.post("/me/appointments", verifyJWT, bookAppointment);
router.get("/me/appointments", verifyJWT, listMyAppointments);
router.patch("/me/appointments/:id/cancel", verifyJWT, cancelAppointment);

export default router;
