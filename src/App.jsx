import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './Components/ThemeToggle'
import UserDashboard from './Pages/UserDashboard'
import Home from './Pages/Home'
import NotFound from './Pages/404'
import Admin from './Pages/Admin'
import Header from './Components/Header'
import ProtectedRoute from './Components/ProtectedRoute'
import Actor from './Pages/Actor'
import Footer from './Components/Footer';
import Actors from './Pages/Actors';
import Movies from './Pages/Movies';
import Movie from './Pages/Movie';


function App() {

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<> <Header /> <Home/> <Footer /> </>} />
            <Route path='/actor/:actorid' element={<> <Header /> <Actor/> <Footer /></>} />
            <Route path='/movie/:mediaid' element={<> <Header /> <Movie/> <Footer /></>} />
            <Route path='/admin' element={<><Header /><Admin /> <Footer /></>} />
            <Route path="/signin" element={<ProtectedRoute element={<SignIn />} />} />
            <Route path="/signup" element={<ProtectedRoute element={<SignUp />} />} />
            <Route path="/actors" element={<><Header /><Actors /> <Footer /></>} />
            <Route path="/tv-shows" element={<><Header /><Movies /> <Footer /></>} />
            <Route path="/profile/:username" element={<ProtectedRoute element={<><Header /><UserDashboard /> <Footer /></>} authRequired={true} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
