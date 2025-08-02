import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    dob: { type: Date, required: true },
    number: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    qualification: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    resume: { type: String },
    remark: {
      type: String,
    },
    enrollment: {
      type: Boolean,
    },
    video: {
      type: String,
    },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("registeredcandidates", candidateSchema);
export default Candidate;
