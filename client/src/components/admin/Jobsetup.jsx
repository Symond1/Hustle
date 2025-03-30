import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import useGetJobById from "@/hooks/useGetJobById";

const JobSetup = () => {
  const params = useParams(); // { id }
  console.log("Job ID from params:", params.id); // Debug log
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Custom hook to fetch job details using the job id
  useGetJobById(params.id);

  const { singleJob } = useSelector((store) => store.job); // Get job details from Redux
  const { token } = useSelector((state) => state.auth); // Access token from Redux

  // Setup local state with initial values (company fields removed)
  const [input, setInput] = useState({
    title: singleJob?.title || "",
    jobType: singleJob?.jobType || "",
    location: singleJob?.location || "",
    description: singleJob?.description || "",
    responsibilities: singleJob?.responsibilities || "",
    qualifications: singleJob?.qualifications || "",
    salary: singleJob?.salary || "",
    jobNiche: singleJob?.jobNiche || "",
    industry: singleJob?.industry || "",
    position: singleJob?.position || "",
  });

  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Create a JSON payload instead of FormData
    const payload = {
      title: input.title,
      jobType: input.jobType,
      location: input.location,
      description: input.description,
      responsibilities: input.responsibilities,
      qualifications: input.qualifications,
      salary: input.salary,
      jobNiche: input.jobNiche,
      industry: input.industry,
      position: input.position,
    };

    console.log("Payload:", payload);

    try {
      setLoading(true);

      if (!token) {
        toast.error("Token not found, please log in again.");
        return;
      }

      const res = await axios.patch(
        `${JOB_API_END_POINT}/update/${params.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Job details updated successfully!");
        // Delay navigation for a brief moment to allow the toast to be seen
        setTimeout(() => {
          navigate("/admin/jobs");
        }, 2000);
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Sync input state with Redux job data to prevent issues with the initial state
  useEffect(() => {
    setInput({
      title: singleJob?.title || "",
      jobType: singleJob?.jobType || "",
      location: singleJob?.location || "",
      description: singleJob?.description || "",
      responsibilities: singleJob?.responsibilities || "",
      qualifications: singleJob?.qualifications || "",
      salary: singleJob?.salary || "",
      jobNiche: singleJob?.jobNiche || "",
      industry: singleJob?.industry || "",
      position: singleJob?.position || "",
    });
  }, [singleJob]);

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto my-10 p-4">
        <form onSubmit={submitHandler}>
          <div className="flex items-center gap-5 mb-6">
          <Button
  onClick={() => navigate("/admin/jobs")}
  variant="outline"
  className="flex items-center gap-2 bg-black text-white font-semibold hover:bg-gray-800"
>
  <ArrowLeft />
  <span>Back</span>
</Button>

            <h1 className="font-bold text-2xl">Job Update</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input
                type="text"
                name="title"
                value={input.title}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                type="text"
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Responsibilities</Label>
              <Input
                type="text"
                name="responsibilities"
                value={input.responsibilities}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Qualifications</Label>
              <Input
                type="text"
                name="qualifications"
                value={input.qualifications}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type="number"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Job Niche</Label>
              <Input
                type="text"
                name="jobNiche"
                value={input.jobNiche}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Input
                type="text"
                name="industry"
                value={input.industry}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                type="number"
                name="position"
                value={input.position}
                onChange={changeEventHandler}
              />
            </div>
          </div>
          <div className="mt-6">
            {loading ? (
              <Button className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Update Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSetup;
