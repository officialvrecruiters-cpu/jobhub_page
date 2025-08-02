import Candidate from "../models/registeredcandidates.model.js";

// Create a new candidate
export const registerCandidate = async (req, res) => {
  try {
    const {
      fullname,
      email,
      position,
      dob,
      number,
      qualification,
      gender,
      address,
    } = req.body;

    if (
      !fullname ||
      !email ||
      !position ||
      !dob ||
      !number ||
      !qualification ||
      !gender ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newCandidate = new Candidate(req.body);

    await newCandidate.save();
    res.status(201).json({
      message: "Candidate registered successfully",
      candidate: newCandidate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all candidates

export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a candidate

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
