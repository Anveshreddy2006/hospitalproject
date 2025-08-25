import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    // keep doctor simple for now; later you can ref a Doctor model
    doctorName: { type: String, required: true, trim: true, index: true },
    reason: { type: String, trim: true },
    dateTime: { type: Date, required: true, index: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, dateTime: -1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
