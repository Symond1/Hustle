import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home';
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import Company from './components/Company';
import JobDescription from './components/JobDescription';
import Companies from './components/admin/Companies';
import About from './components/about';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import AdminEvents from './components/admin/AdminEvents';
import PostJob from './components/admin/PostJob';
import PostEvent from './components/admin/PostEvent';
import Applicants from './components/admin/Applicants';
import InteractiveSection from './components/pages/InteractiveSection';
import ResetPassword from './components/auth/ResetPassword';
import Events from './components/Events';
import Event from './components/Event';
import EventDescription from './components/EventDescription';
import AdminJobDetails from './components/admin/AdminJobDetails';
import AdminEventAttendees from './components/admin/AdminEventAttendees';
import UpdateProfileDialog from './components/UpdateProfileDialog';
import JobSetup from './components/admin/JobSetup';

const appRouter = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/jobs', element: <Jobs /> },
  { path: '/description/:id', element: <JobDescription /> },
  { path: '/browse', element: <Browse /> },
  { path: '/profile', element: <Profile /> },
  { path: '/events', element: <Events /> },
  { path: '/event', element: <Event /> },
  { path: '/event/:id', element: <EventDescription /> },
  { path: '/company', element: <Company /> },
  { path: '/interactive', element: <InteractiveSection /> },
  { path: '/about', element: <About /> },
  { path: '/UpdateProfileDialog', element: <UpdateProfileDialog /> },
  
  { path: '/admin/companies', element: <Companies /> },
  { path: '/admin/companies/create', element: <CompanyCreate /> },
  { path: '/admin/companies/:id', element: <CompanySetup /> },
  { path: '/admin/jobs', element: <AdminJobs /> },
  { path: '/admin/jobs/create', element: <PostJob /> },
  { path: '/admin/jobs/:id/setup', element: <JobSetup /> },
  { path: '/admin/events/:eventId/attendees', element: <AdminEventAttendees /> },
  { path: '/admin/jobs/:jobId/applicants', element: <Applicants /> },
  { path: '/admin/jobs/:jobId/details', element: <AdminJobDetails /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/admin/events', element: <AdminEvents /> },
  { path: '/admin/events/create', element: <PostEvent /> },
]);

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
