import { Employee } from "../models/employee.model.js";
import { Otp } from "../models/otp.model.js";
import { Job } from "../models/job.model.js";
import { uploadOnCloudinary } from "../configs/cloudinary.js";
import { mailSender } from "../utils/emailSender.utils.js";
import { otpTemplate } from "../templates/otpSenderMail.js";
import bcrypt from "bcrypt";

const generateAccessToken = async (employeeId) => {
  try {
    const employee = await Employee.findById(employeeId);
    const accessToken = await employee.generateAccessToken();

    await employee.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    throw Error("Something went wrong while generating AccessToken", error);
  }
};

export const otpGenerateSystem = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email number is required",
      });
    }

    const otpGenerator = Math.floor(Math.random() * 1000000);

    const isOtpExits = await Otp.findOne({ otp: otpGenerator });

    if (isOtpExits) {
      otpGenerator = Math.floor(Math.random() * 1000000);
    }

    await Otp.create({
      email,
      otp: otpGenerator,
    });

    await mailSender(email, "One Time Password", otpTemplate(otpGenerator));

    return res.status(200).json({
      message: "Otp successfully genrated!",
      otp: otpGenerator,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while generating otp",
      error,
    });
  }
};

export const checkOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const isOtpPresent = await Otp.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (isOtpPresent.length === 0) {
      return res.status(404).json({
        message: "Otp is not found",
      });
    } else if (otp !== isOtpPresent[0].otp) {
      return res.status(403).json({
        message: "Otp is not correct",
      });
    }

    const alreadyExists = await Employee.findOne({
      email,
    });

    if (alreadyExists) {
      // Generate Token
      const { accessToken } = await generateAccessToken(alreadyExists._id);

      const options = {
        httpOnly: true,
        secure: true,
      };

      return res.status(200).cookie("accessToken", accessToken, options).json({
        sucess: true,
        message: "Login Successfully !",
        employee: alreadyExists,
        accessToken,
      });
    }

    return res.status(200).json({
      message: "Successfully Verified!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while checking otp",
    });
  }
};

//register

export const employeeAccount = async (req, res) => {
  try {
    // console.log("Request Body:", req.body);
    // console.log("Uploaded File:", req.file);

    const {
      fullName,
      companyName,
      mobileNumber,
      email,
      gender,
      gstNumber,
      fromWhere,
      password,
      confirmPassword,
    } = req.body;

    if (
      [
        fullName,
        companyName,
        mobileNumber,
        email,
        gender,
        gstNumber,
        fromWhere,
        password,
        confirmPassword,
      ].some((data) => data?.trim() === "")
    ) {
      // console.log("Missing field(s)");
      return res.status(400).json({
        message: "Required all fields",
      });
    }

    if (password !== confirmPassword) {
      // console.log("Passwords do not match");
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const avatarLocalPath = req.file?.path;
    // console.log("Avatar Local Path:", avatarLocalPath);

    if (!avatarLocalPath) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    let avatar;
    try {
      // console.log("Uploading to Cloudinary...");
      avatar = await uploadOnCloudinary(avatarLocalPath);
      // console.log("Uploaded avatar:", avatar);
    } catch (cloudErr) {
      // console.error("Cloudinary upload failed:", cloudErr);
      return res.status(500).json({
        message: "Cloudinary upload failed",
        error: cloudErr.message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("Hashed Password:", hashedPassword);

    const newEmployee = await Employee.create({
      companyName,
      email,
      fromWhere,
      fullName,
      gender,
      gstNumber,
      mobileNumber,
      password: hashedPassword,
      avatar:
        avatar.url ||
        `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`,
    });

    // console.log("New Employee Created:", newEmployee);

    const { accessToken } = await generateAccessToken(newEmployee._id);
    // console.log("Access Token:", accessToken);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      message: "Signup Successfully!",
      employee: newEmployee,
      accessToken,
    });
  } catch (error) {
    // console.error("Error during registration:", error);
    res.status(500).json({
      message: "Something went wrong while registration",
      error: error.message, // helpful for debugging
    });
  }
};

//login
export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields required!",
      });
    }

    const employeeExists = await Employee.findOne({ email });

    if (!employeeExists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      employeeExists.password
    );

    if (!isPasswordCorrect) {
      return res.status(403).json({
        message: "Password is incorrect",
      });
    }

    // Generate Token
    const { accessToken } = await generateAccessToken(employeeExists._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      message: "Login Successfully !",
      employee: employeeExists,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while login",
    });
  }
};

//logout
export const employeeLogout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    return res.status(200).json({
      message: "Logout Successfully !",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while logout",
    });
  }
};

export const myJobs = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const employeeData = await Employee.findById(employeeId)
      .populate("jobs")
      .exec();

    return res.status(200).json({
      message: "Jobs Data Fetched",
      employee: employeeData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "Something went wrong while fetching the data of Jobs in Employee",
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { companyName, fullName, gender, email } = req.body;
    const employeeId = req.user._id;

    const updateDetails = await Employee.findByIdAndUpdate(
      employeeId,
      {
        companyName,
        fullName,
        gender,
        email,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Update Successfully!",
      employee: updateDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while edit the profile",
    });
  }
};

export const selectingStudentSystem = async (req, res) => {
  const studentsData = req.body;
  try {
    const selectedMyStudents = await Promise.all(
      studentsData.map(async ({ studentId, jobId }) => {
        return Job.updateOne(
          { _id: jobId },
          {
            $pull: { students: studentId },
            $addToSet: { selectedStudents: studentId },
          }
        );
      })
    );
    return res.status(200).json({
      message: "Student is Selected",
      selectedMyStudents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while selecting students",
    });
  }
};

export const selectingStudentsData = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const employeeData = await Employee.findById(employeeId);

    const allSelectedStudents = await Job.find({
      _id: { $in: employeeData.jobs },
    })
      .populate("selectedStudents")
      .exec();

    const response = allSelectedStudents.map((data) => data.selectedStudents);

    return res.status(200).json({
      message: "Selected Students application fetched!",
      students: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while getting selected students",
    });
  }
};

export const deSelectingStudents = async (req, res) => {
  const deSelectStudentsData = req.body;
  try {
    const deSelectedMyStudents = await Promise.all(
      deSelectStudentsData.map(({ studentId, jobId }) => {
        return Job.updateOne(
          { _id: jobId },
          {
            $pull: { selectedStudents: studentId },
            $addToSet: { students: studentId },
          }
        );
      })
    );

    return res.status(200).json({
      message: "Student is De-Selected",
      deSelectedMyStudents,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while De-Selecting students",
    });
  }
};

export const myJobApplyStudents = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const employeeData = await Employee.findById(employeeId);

    const allStudents = await Job.find({
      _id: { $in: employeeData.jobs },
    })
      .populate("students")
      .exec();

    const response = allStudents.map((data) => data.students);

    return res.status(200).json({
      message: "Students application fetched!",
      students: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while getting my students",
    });
  }
};
