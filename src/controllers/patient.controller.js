import path from "path";
import { fileURLToPath } from "url";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensure, isFuture } from "../utils/validators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Create/complete patient profile (once after user registers)
export const upsertMyProfile = asyncHandler(async (req, res) => {
  const { name, age, gender, phone, address, emergencyContact } = req.body;

  ensure(name, "Name is required");

  const payload = { name, age, gender, phone, address, emergencyContact };

  const profile = await Patient.findOneAndUpdate(
    { user: req.user._id },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ message: "Profile saved", profile });
});

// 2) Get my profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Patient.findOne({ user: req.user._id }).lean();
  ensure(profile, "Profile not found", 404);
  res.json({ profile });
});

// 3) Update my profile (partial)
export const patchMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "age", "gender", "phone", "address", "emergencyContact"];
  const updates = {};
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

  const profile = await Patient.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true }
  );
  ensure(profile, "Profile not found", 404);
  res.json({ message: "Profile updated", profile });
});

// 4) Upload medical report (multer places file info on req.file)
export const uploadReport = asyncHandler(async (req, res) => {
  ensure(req.file, "No file uploaded");
  const profile = await Patient.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        reports: {
          originalName: req.file.originalname,
          fileUrl: `/uploads/${req.file.filename}`,
          size: req.file.size || 0,
        },
      },
    },
    { new: true }
  );
  ensure(profile, "Profile not found", 404);
  res.status(201).json({ message: "Report uploaded", reports: profile.reports });
});

// 5) List my reports
export const listMyReports = asyncHandler(async (req, res) => {
  const profile = await Patient.findOne({ user: req.user._id }, { reports: 1, _id: 0 }).lean();
  ensure(profile, "Profile not found", 404);
  res.json({ reports: profile.reports ?? [] });
});

// 6) Book appointment
export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorName, reason, dateTime } = req.body;
  ensure(doctorName && dateTime, "doctorName and dateTime are required");

  ensure(isFuture(dateTime), "Appointment must be in the future");

  const patient = await Patient.findOne({ user: req.user._id }).lean();
  ensure(patient, "Create patient profile first", 400);

  const appt = await Appointment.create({
    patient: patient._id,
    doctorName,
    reason,
    dateTime: new Date(dateTime),
  });

  res.status(201).json({ message: "Appointment booked", appointment: appt });
});

// 7) My appointments
export const listMyAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).lean();
  ensure(patient, "Create patient profile first", 400);

  const appts = await Appointment.find({ patient: patient._id })
    .sort({ dateTime: -1 })
    .lean();

  res.json({ appointments: appts });
});

// 8) Cancel appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appt = await Appointment.findById(id);
  ensure(appt, "Appointment not found", 404);

  // make sure it belongs to current user
  const patient = await Patient.findOne({ user: req.user._id }).lean();
  ensure(patient && String(appt.patient) === String(patient._id), "Not allowed", 403);

  if (appt.status !== "scheduled") {
    return res.status(400).json({ message: "Only scheduled appointments can be cancelled" });
  }

  appt.status = "cancelled";
  await appt.save();

  res.json({ message: "Appointment cancelled", appointment: appt });
});
