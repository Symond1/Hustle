import React, { useState, useRef, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MIN_EDU_DURATION = 3; // Minimum years difference for education

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Delhi",
  "Puducherry",
];

const skillOptions = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "SQL",
  "MongoDB",
  "CRM",
  "Digital Marketing",
  "SEO",
  "Content Marketing",
  "Social Media",
  "Google Ads",
  "Branding",
  "Finance",
  "Accounting",
  "Financial Analysis",
  "Investment",
  "Risk Management",
  "Business Development",
  "Sales",
  "Project Management",
];

// Custom multi-select component for Skills.
const MultiSelectSkills = ({ options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleCustomSkillAdd = (e) => {
    e.preventDefault();
    const trimmedSkill = customSkill.trim();
    if (trimmedSkill && !selected.includes(trimmedSkill)) {
      onChange([...selected, trimmedSkill]);
      setCustomSkill("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCustomSkillAdd(e);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="mt-1 p-2 text-sm border rounded cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-500">Select or add skills</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
          {options.map((option, idx) => (
            <div
              key={idx}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selected.includes(option) ? "bg-blue-100" : ""
              }`}
              onClick={() => toggleOption(option)}
            >
              {option}
            </div>
          ))}
          <form onSubmit={handleCustomSkillAdd} className="p-2 border-t">
            <input
              type="text"
              placeholder="Add custom skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-1 border rounded text-sm"
            />
          </form>
        </div>
      )}
    </div>
  );
};

const UpdateProfileDialog = () => {
  const { token, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Flag to differentiate recruiter vs. jobseeker.
  const isRecruiter = user?.role === "Recruiter";

  // Extract education and experience info if available.
  const educationInfo = Array.isArray(user?.profile?.education) && user.profile.education.length > 0
    ? user.profile.education[0]
    : {};
  const experienceInfo = Array.isArray(user?.profile?.experience) && user.profile.experience.length > 0
    ? user.profile.experience[0]
    : {};

  // Pre-fill registration fields with user's current data.
  const [input, setInput] = useState({
    // Common fields (pre-filled)
    city: user?.city || "",
    state: user?.state || "",
    gender: user?.profile?.gender || "",
    address: user?.address || "",
    // Jobseeker additional fields
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    skills: user?.profile?.skills || [],
    file: null,
    dob: user?.profile?.dob
      ? new Date(user?.profile?.dob).toISOString().split("T")[0]
      : "",
    company: "",
    // Education fields pre-filled if available
    educationDegree: educationInfo?.degree || "",
    educationField: educationInfo?.fieldOfStudy || "",
    educationStartYear: educationInfo?.startDate || "",
    educationEndYear: educationInfo?.endDate || "",
    // Experience fields pre-filled if available
    experienceCompanyName: experienceInfo?.companyName || "",
    experienceRole: experienceInfo?.role || "",
    experienceStartYear: experienceInfo?.startDate || "",
    experienceEndYear: experienceInfo?.endDate || "",
  });

  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  // Validate a section only if any field in that section is filled.
  const validateSection = (fields, sectionName) => {
    const isTouched = fields.some((field) => input[field.key] !== "");
    if (isTouched) {
      for (const field of fields) {
        if (!input[field.key]) {
          toast.error(`${sectionName}: ${field.label} is required`);
          return false;
        }
      }
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    let formData = new FormData();

    if (isRecruiter) {
      // For Recruiters, only update city, state, gender, and address.
      formData.append("city", input.city);
      formData.append("state", input.state);
      formData.append("gender", input.gender);
      formData.append("address", input.address);
    } else {
      // For Jobseekers, validate and build the full form data.
      const educationFields = [
        { key: "educationDegree", label: "Degree" },
        { key: "educationField", label: "Field of Study" },
        { key: "educationStartYear", label: "Start Year" },
        { key: "educationEndYear", label: "End Year" },
      ];
      const experienceFields = [
        { key: "experienceCompanyName", label: "Company Name" },
        { key: "experienceRole", label: "Role" },
        { key: "experienceStartYear", label: "Start Year" },
        { key: "experienceEndYear", label: "End Year" },
      ];

      if (!validateSection(educationFields, "Education")) return;
      if (input.educationStartYear && input.educationEndYear) {
        const duration =
          parseInt(input.educationEndYear) - parseInt(input.educationStartYear);
        if (duration < MIN_EDU_DURATION) {
          toast.error(`Education duration should be at least ${MIN_EDU_DURATION} years`);
          return;
        }
      }
      if (!validateSection(experienceFields, "Experience")) return;

      Object.keys(input).forEach((key) => {
        if (key === "skills") {
          // Join the skills array as a comma-separated string.
          formData.append(key, input.skills.join(", "));
        } else if (key !== "file") {
          formData.append(key, input[key]);
        }
      });
      if (input.file) {
        formData.append("file", input.file);
        const fileType = user?.role === "Jobseeker" ? "resume" : "profilePhoto";
        formData.append("fileType", fileType);
      }

      const educationData = [
        {
          degree: input.educationDegree,
          fieldOfStudy: input.educationField,
          startDate: input.educationStartYear,
          endDate: input.educationEndYear,
        },
      ];
      formData.append("education", JSON.stringify(educationData));

      const experienceData = [
        {
          companyName: input.experienceCompanyName,
          role: input.experienceRole,
          startDate: input.experienceStartYear,
          endDate: input.experienceEndYear,
        },
      ];
      formData.append("experience", JSON.stringify(experienceData));
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/updateProfile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating profile"
      );
    } finally {
      setLoading(false);
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <Button onClick={() => navigate(-1)} className="flex items-center space-x-2">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Button>
        <h1 className="text-xl font-semibold">Update Profile</h1>
        <Button onClick={() => navigate(-1)} className="p-2">
          <X size={20} />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-auto">
        <form
          onSubmit={submitHandler}
          className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6"
        >
          {isRecruiter ? (
            // Recruiter sees only City, State, Gender, and Address fields.
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={input.city}
                    onChange={changeEventHandler}
                    className="mt-1 p-2 text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State
                  </Label>
                  <select
                    id="state"
                    name="state"
                    value={input.state}
                    onChange={changeEventHandler}
                    className="mt-1 p-2 text-sm border rounded"
                  >
                    <option value="">Select</option>
                    {stateOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={input.gender}
                    onChange={changeEventHandler}
                    className="mt-1 p-2 text-sm border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={input.address}
                  onChange={changeEventHandler}
                  className="mt-1 p-2 text-sm"
                />
              </div>
            </>
          ) : (
            // Jobseeker sees the full form.
            <>
              {/* Registration Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Full Name", id: "fullname", type: "text" },
                  { label: "Email", id: "email", type: "email" },
                  { label: "Phone", id: "phoneNumber", type: "text" },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      value={input[field.id]}
                      onChange={changeEventHandler}
                      className="mt-1 p-2 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "City", id: "city", type: "text" },
                  { label: "State", id: "state", type: "select", options: stateOptions },
                  { label: "Address", id: "address", type: "text" },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    {field.type === "select" ? (
                      <select
                        id={field.id}
                        name={field.id}
                        value={input[field.id]}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm border rounded"
                      >
                        <option value="">Select</option>
                        {field.options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        value={input[field.id]}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="skills" className="text-sm font-medium">
                    Skills
                  </Label>
                  <MultiSelectSkills
                    options={skillOptions}
                    selected={input.skills}
                    onChange={(selected) =>
                      setInput({ ...input, skills: selected })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={input.gender}
                    onChange={changeEventHandler}
                    className="mt-1 p-2 text-sm border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="dob" className="text-sm font-medium">
                    DOB
                  </Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={input.dob}
                    onChange={changeEventHandler}
                    className="mt-1 p-2 text-sm"
                  />
                </div>
              </div>

              {/* Education & Experience Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education Section */}
                <div className="space-y-3 border p-4 rounded">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <Label htmlFor="educationDegree" className="text-sm">
                        Degree
                      </Label>
                      <select
                        id="educationDegree"
                        name="educationDegree"
                        value={input.educationDegree}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm border rounded"
                      >
                        <option value="">Select Degree</option>
                        <option value="Bachelor">Bachelor</option>
                        <option value="Master">Master</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="educationField" className="text-sm">
                        Field
                      </Label>
                      <select
                        id="educationField"
                        name="educationField"
                        value={input.educationField}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm border rounded"
                      >
                        <option value="">Select Field</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Technology">Technology</option>
                        <option value="Computer Application">Computer App</option>
                        <option value="Science">Science</option>
                        <option value="Arts">Arts</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Business Administration">
                          Business Administration
                        </option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="educationStartYear" className="text-sm">
                        Start Year
                      </Label>
                      <Input
                        id="educationStartYear"
                        name="educationStartYear"
                        type="number"
                        placeholder="YYYY"
                        value={input.educationStartYear}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="educationEndYear" className="text-sm">
                        End Year
                      </Label>
                      <Input
                        id="educationEndYear"
                        name="educationEndYear"
                        type="number"
                        placeholder="YYYY"
                        value={input.educationEndYear}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div className="space-y-3 border p-4 rounded">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <Label htmlFor="experienceCompanyName" className="text-sm">
                        Company
                      </Label>
                      <Input
                        id="experienceCompanyName"
                        name="experienceCompanyName"
                        type="text"
                        value={input.experienceCompanyName}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="experienceRole" className="text-sm">
                        Role
                      </Label>
                      <Input
                        id="experienceRole"
                        name="experienceRole"
                        type="text"
                        value={input.experienceRole}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="experienceStartYear" className="text-sm">
                        Start Year
                      </Label>
                      <Input
                        id="experienceStartYear"
                        name="experienceStartYear"
                        type="number"
                        placeholder="YYYY"
                        value={input.experienceStartYear}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="experienceEndYear" className="text-sm">
                        End Year
                      </Label>
                      <Input
                        id="experienceEndYear"
                        name="experienceEndYear"
                        type="number"
                        placeholder="YYYY"
                        value={input.experienceEndYear}
                        onChange={changeEventHandler}
                        className="mt-1 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume for Jobseekers */}
              {user?.role === "Jobseeker" && (
                <div className="flex flex-col">
                  <Label htmlFor="file" className="text-sm">
                    Resume (PDF)
                  </Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="application/pdf"
                    onChange={fileChangeHandler}
                    className="mt-1 p-2 text-sm"
                  />
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            {loading ? (
              <Button className="flex items-center text-sm p-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </Button>
            ) : (
              <Button type="submit" className="text-sm p-2">
                Update
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default UpdateProfileDialog;
