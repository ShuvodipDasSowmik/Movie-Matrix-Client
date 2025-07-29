import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ThemeToggle from './Components/ThemeToggle'
import UserDashboard from './Pages/UserDashboard'
import Home from './Pages/Home'
import NotFound from './Pages/404'
import Admin from './Pages/Admin'
import Header from './Components/Header'
import Actor from './Pages/Actor'
import Footer from './Components/Footer';
import Actors from './Pages/Actors';
import Movies from './Pages/Movies';
import Movie from './Pages/Movie';
import Series from './Pages/Series';
import ForYou from './Pages/ForYou';
import UnauthorizeAccess from "./Pages/UnauthorizeAccess";
import NotificationContainer from './Components/Notification';
import Blogs from './Pages/Blogs';
import ProtectedRoute from './Components/ProtectedRoute';
import axios from 'axios';
import { useEffect } from 'react';
import About from './Pages/About';
import BrowseGenre from './Pages/BrowseGenre';
import GenrePage from './Pages/GenrePage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper component for scroll-to-top on route change
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
  return null;
}

function App() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let visitorID = localStorage.getItem('visitorID');
        if (!visitorID) {
          visitorID = 'visitor-' + Math.random().toString(36).slice(2, 18) + Date.now();
          localStorage.setItem('visitorID', visitorID);

          await axios.post(`${API_URL}/track-activity`, { visitorID });
        }
      }

      catch (err) {
        console.error('Failed to track user activity:', err);
      }
    };
    trackVisitor();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path='/' element={<> <Header /> <Home /> <Footer /> </>} />
              <Route path='/actor/:actorid' element={<> <Header /> <Actor /> <Footer /></>} />
              <Route path='/series1/:mediaid' element={<> <Header /> <Series /> <Footer /></>} />
              <Route path='/movie/:mediaid' element={<> <Header /> <Movie /> <Footer /></>} />              <Route path='/admin' element={
                <ProtectedRoute requiredRole="ADMIN">
                  <><Header /><Admin /> <Footer /></>
                </ProtectedRoute>
              } />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path='/unauthorized' element={<UnauthorizeAccess />} />
              <Route path="/actors" element={<><Header /><Actors /> <Footer /></>} />
              <Route path="/about" element={<><Header /><About /> <Footer /></>} />
              <Route path="/tv-shows" element={<><Header /><Movies /> <Footer /></>} />
              <Route path="/posts" element={<><Header /><Blogs /> <Footer /></>} />
              <Route path = '/genre' element={<><Header /><BrowseGenre /> <Footer /></>} />
              <Route path="/genre/:genreid" element={<><Header /><GenrePage /> <Footer /></>} /> 
              <Route path = '/genre' element={<><Header /><BrowseGenre /> <Footer /></>} />
              <Route path="/profile/:username" element={
                <ProtectedRoute>
                  <><Header /><UserDashboard /> <Footer /></>
                </ProtectedRoute>
              } />
              <Route path='/for-you' element={
                <ProtectedRoute>
                  <><Header /><ForYou /> <Footer /></>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ThemeToggle />
            <NotificationContainer />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App