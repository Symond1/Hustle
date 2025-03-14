import React, { useState } from 'react';

const About = () => {
  const [isOpen, setIsOpen] = useState(false); // Manage open state for "About Us" section

  const toggleSection = () => {
    setIsOpen(!isOpen); // Toggle the "About Us" section open/close
  };

  return (
    <div className="about-container">
      <style>
        {`
          .about-container {
            font-family: Arial, sans-serif;
            margin: 50px;
            color: #333;
            text-align: center;
          }
          .about-title {
            font-size: 3rem;
            background: linear-gradient(to right, #1f78b4, #e67e22); /* Gradient Text */
            -webkit-background-clip: text;
            color: transparent;
            margin-bottom: 20px;
            font-weight: bold;
            text-transform: uppercase;
            animation: fadeIn 2s ease-in-out;
          }
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          .about-title span {
            font-weight: bold;
            color: #fff;
          }

          .about-intro {
            font-size: 1.2rem;
            line-height: 1.6;
            color: #555;
            margin-top: 20px;
            animation: slideIn 1.5s ease-in-out;
          }

          @keyframes slideIn {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .highlight {
            color: #e67e22;
            font-weight: bold;
          }

          .team-title {
            font-size: 1.8rem;
            color: #4a4a4a;
            margin-top: 40px;
            animation: fadeIn 1.5s ease-in-out;
          }

          .team-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 20px;
            animation: fadeIn 2s ease-in-out;
            text-align: left;
          }

          .team-member {
            background-color: #f4f4f4;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            flex: 1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
          }

          .team-member:hover {
            transform: translateY(-10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .member-name {
            font-size: 1.5rem;
            color: #1f78b4;
            margin-bottom: 10px;
          }

          .member-description {
            font-size: 1rem;
            line-height: 1.5;
            color: #666;
          }

          .mission-title {
            font-size: 1.8rem;
            color: #4a4a4a;
            margin-top: 40px;
            text-align: center;
            font-weight: bold;
            color: #1f78b4;
          }

          .cta-title {
            font-size: 2rem;
            color: #fff;
            margin-top: 40px;
            font-weight: bold;
            background-color: #1f78b4;
            padding: 20px;
            border-radius: 10px;
            cursor: pointer;
            text-transform: uppercase;
            transition: background-color 0.3s ease;
          }

          .cta-title:hover {
            background-color: #e67e22;
          }

          em {
            font-style: italic;
            color: #e67e22;
          }

          h2, p {
            margin-bottom: 20px;
          }

          .cta-button {
            font-size: 1.2rem;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #1f78b4;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          /* Accordion styling */
          .about-section {
            overflow: hidden;
            height: 0;
            transition: height 0.5s ease-in-out;
            padding-top: 0;
            padding-bottom: 0;
          }

          .about-section.open {
            height: auto;
            padding-top: 20px;
            padding-bottom: 20px;
          }
        `}
      </style>

      <h1 className="about-title">
        Our Journey, Our Dream, Our Hustle
      </h1>
      <p className="about-intro">
        At the heart of every successful project lies a story of <strong>collaboration</strong>, <strong>growth</strong>, and the <strong>overcoming of challenges</strong>. Our journey at <span className="highlight">St. Xavier's College</span> began in Semester 1, with three unique individuals coming together to create something extraordinary.
      </p>

      <button className="cta-button" onClick={toggleSection}>
        {isOpen ? 'Close About Us' : 'Open About Us'}
      </button>

      {/* Accordion content */}
      <div className={`about-section ${isOpen ? 'open' : ''}`}>
        <h2 className="team-title">The Team Members:</h2>
        <div className="team-container">
          <div className="team-member">
            <h3 className="member-name">The Studious One 📚</h3>
            <p className="member-description">
              Focused, disciplined, and always prepared, this team member set the pace for our success. Their drive for academic excellence and passion for understanding complex concepts ensured that every detail of our project was well thought out and executed.
            </p>
          </div>
          <div className="team-member">
            <h3 className="member-name">The Talkative One 🗣️</h3>
            <p className="member-description">
              Full of energy and always bringing people together, this team member kept us motivated. Their endless enthusiasm and ability to communicate ideas made sure our team was always aligned and excited to tackle challenges. They were the voice that kept us moving forward!
            </p>
          </div>
          <div className="team-member">
            <h3 className="member-name">The Irregular & Smart One 🧠💡</h3>
            <p className="member-description">
              While this person was occasionally unpredictable and missed a class or two, their sharp intellect and innovative thinking were what truly set them apart. Their unconventional approach to problems and quick learning made them a brilliant asset to the team, ensuring we found creative solutions to every obstacle.
            </p>
          </div>
        </div>

        <h2 className="about-title">The Birth of Hustle</h2>
        <p>
          The idea for <em>Hustle</em> was born in those college classrooms, inspired by the needs of the job market. We wanted to build something that would help job seekers find their dream roles with ease. Through sleepless nights, brainstorming sessions, and countless hours of coding, we developed <em>Hustle</em>—a platform designed to streamline the job search, track applications, and connect job seekers and employers.
        </p>
        <h2 className="mission-title">Our Mission</h2>
        <p>
          To provide a platform that simplifies the job-seeking journey by harnessing the power of technology. From detailed profiles to interview scheduling, <em>Hustle</em> makes it easier for you to find the job you're passionate about.
        </p>

        <h2 className="about-title">Looking Ahead</h2>
        <p>
          Our journey with <em>Hustle</em> has only just begun! What started as a college project now aims to help thousands of job seekers worldwide. We're continuously working to improve the platform and introduce new features that will revolutionize the job market.
        </p>

        <h2 className="cta-title">Join the Hustle</h2>
      </div>
    </div>
  );
};

export default About;
