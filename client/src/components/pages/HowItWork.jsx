import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandPeace,
  faSearch,
  faMoneyBillWave,
  faHandsHelping,
  faEnvelopeOpenText,
  faIdCard,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useSelector } from "react-redux"; // Assuming you're using Redux for store management

export default function HowItWorks() {
  // Get user role from Redux store
  const { role } = useSelector((store) => store.auth.user || {}); // Get user role safely

  return (
    <div className="bg-white md:pt-32 pt-16">
      {role === "Recruiter" ? (
        <>
          <h1 className="md:text-6xl text-4xl font-bold text-center text-gray-900 ">
            How <strong>Hustle</strong> works for <strong>Recruiter</strong>
          </h1>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-14 md:py-40 md:pb-12 py-12 md:text-left text-center md:w-10/12 w-11/12 mx-auto ">
            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-green-500"
                icon={faCopy}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 1:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3 font-semibold">
                Create a Profile
              </h1>
              <p className="text-xl font-light">
                Promote Your Company To Our Community Of Tech People.
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-indigo-500 "
                icon={faIdCard}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 2:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3  font-semibold">
                Post a Job
              </h1>
              <p className="text-xl font-light">
                Write a Job Description, and Hire a Real Hustlers 
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-primary"
                icon={faEnvelopeOpenText}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 3:
              </div>
              <h1 className="text-3xl  text-gray-900 pb-3 font-semibold">
                Apply
              </h1>
              <p className="text-xl font-light">
                Our Hustle Community Allows Users To Discover and Apply for
                Jobs.
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-yellow-400"
                icon={faHandsHelping}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 4:
              </div>
              <h1 className="text-3xl  text-gray-900 pb-3 font-semibold">
                Interview and hire
              </h1>
              <p className="text-xl font-light">
                If you find an interesting candidate you can interview and hire
                them.
              </p>
            </div>
          </div>
        </>
      ) : role === "Jobseeker" ? (
        <>
          <h1 className="md:text-6xl text-4xl font-bold text-center text-gray-900 ">
            How <strong>Hustle</strong> works for <strong>Applicants</strong>
          </h1>
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-12 md:py-32 py-12 text-center md:w-10/12 w-11/12 mx-auto ">
            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-secondary"
                icon={faSearch}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 1:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3 font-semibold">
                Find a Job
              </h1>
              <p className="text-xl font-light">
                Find Exciting Tech Jobs On The Job Board.
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-yellow-400"
                icon={faHandPeace}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 2:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3  font-semibold">
                Apply For job
              </h1>
              <p className="text-xl font-light">Apply for a job you love.</p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-green-500"
                icon={faMoneyBillWave}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 3:
              </div>
              <h1 className="text-3xl  text-gray-900 pb-3 font-semibold">
                Await Approval
              </h1>
              <p className="text-xl font-light">
                Waiting For Your Job Application To Be Approved By The Recruiter.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="md:text-6xl text-4xl font-bold text-center text-gray-900 ">
            HOW <strong>HUSTLE</strong> WORKS
          </h1>
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-12 md:py-32 py-12 text-center md:w-10/12 w-11/12 mx-auto ">
            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-secondary"
                icon={faSearch}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 1:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3 font-semibold">
                Create Account
              </h1>
              <p className="text-xl font-light">
                Create a User Account For Jobseeker or Recruiters.
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-yellow-400"
                icon={faHandPeace}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 2:
              </div>
              <h1 className="text-3xl text-gray-900 pb-3  font-semibold">
                Log In
              </h1>
              <p className="text-xl font-light">
                Log In With The Account You've Created.
              </p>
            </div>

            <div>
              <FontAwesomeIcon
                className="text-5xl mb-6 text-green-500"
                icon={faMoneyBillWave}
              />
              <div className="text-gray-900 text-md tracking-wide pb-2 uppercase font-semibold">
                Step 3:
              </div>
              <h1 className="text-3xl  text-gray-900 pb-3 font-semibold">
                Let The Hustle Begin
              </h1>
              <p className="text-xl font-light">
                Create a Job Posting or Find The Job You Desire.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
