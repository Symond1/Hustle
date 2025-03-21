# Hustle ⚡

## #Hustle - Let the Hustle Begin 🚀

**Hustle** is an innovative and feature-rich recruitment platform designed to connect job seekers with recruiters efficiently. Unlike other platforms, **Hustle offers a unique event management system** where recruiters can host **Hackathons, Meet & Greet sessions, and Job Marathons**, providing job seekers exclusive opportunities to network, learn from industry experts, and showcase their skills. Our mission is to simplify the hiring process by providing an intuitive and engaging experience for both job seekers and employers.

---

## 📌 Features

### For Job Seekers 🎯
- Create and manage professional profiles with resumes and skills.
- Search for jobs using filters like location, industry, and salary range.
- Apply for jobs with a single click.
- Track application status and receive updates.
- Connect with recruiters and companies.
- **Participate in recruiter-hosted events such as Hackathons and Job Marathons to increase networking opportunities and learn from industry professionals.**

### For Recruiters 🏢
- Post job listings with detailed descriptions and requirements.
- Manage applications and shortlist candidates.
- View job seeker profiles and resumes.
- Organize hiring events and interviews.

### Event Management 🎉
- Recruiters can create and manage events such as:
  - **Hackathons**
  - **Meet & Greet** sessions
  - **Job Marathons**
- Only recruiters can create events, ensuring company-led initiatives.
- Job seekers can register for events and participate in networking opportunities.
- Event confirmation emails are sent to registered participants.

### Email Notifications 📧
- **Password Reset Emails:** Users can reset their passwords via an email link.
- **Event Confirmation Emails:** Attendees receive automatic confirmation upon registering for an event.
- **Nodemailer Integration:** Secure and reliable email delivery for authentication and event notifications.

### Admin Panel 🛠️
- Manage users, recruiters, and job seekers.
- Monitor job postings and applications.
- Handle reported issues and maintain platform integrity.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Redux, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT-based authentication
- **File Uploads:** Multer, Cloudinary
- **Email Service:** Nodemailer

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/hustle.git
cd hustle
```

### 2️⃣ Install Dependencies
#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the **backend** directory and add:
```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173

# Nodemailer Configurations
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

### 4️⃣ Run the Application
#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd client
npm run dev
```

---
## Get Started 🎯

1. **Sign Up:** Create an account on #Hustle.
2. **Complete Your Profile:** Add your resume, skills, and experience.
3. **Apply for Jobs:** Use filters to find the perfect job and apply with a single click.
4. **Register for Events:** Join Hackathons, Meet & Greet sessions, and Job Marathons to network and learn.
5. **Track Your Progress:** Monitor your job applications and event participations.

---

**#Hustle** - Where Opportunities Meet Talent. 🚀

