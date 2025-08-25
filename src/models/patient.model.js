import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // served from /public/uploads
    size: { type: Number, default: 0 },
  },
  { _id: false, timestamps: { createdAt: "uploadedAt", updatedAt: false } }
);

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true, unique: true },
    name: { type: String, required: true, trim: true, index: true },
    age: { type: Number, min: 0, max: 130 },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    reports: [reportSchema],
  },
  { timestamps: true }
);

// helpful indexes
patientSchema.index({ name: "text", phone: 1 });

export const Patient = mongoose.model("Patient", patientSchema);
