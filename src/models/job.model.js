import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
      lowercase: true,
    },
    jobRole: {
      type: String,
      required: true,
      lowercase: true,
    },
    numberOfPosition: {
      type: Number,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    workType: {
      type: String,
      required: true,
    },
    ExpireJob: {
      type: String,
    },
    benefits: {
      type: [String],
    },
    salary: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    english: {
      type: String,
    },
    experience: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    interviewMode: {
      type: String,
      required: true,
    },
    communication: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    selectedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);
export const Job = mongoose.model("Job", jobSchema);
