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


function App() {

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<> <Header /> <Home/> </>} />
            <Route path='/actor/:actorname' element={<> <Header /> <Actor/> </>} />
            <Route path='/admin' element={<><Header /><Admin /></>} />
            <Route path="/signin" element={<ProtectedRoute element={<SignIn />} />} />
            <Route path="/signup" element={<ProtectedRoute element={<SignUp />} />} />
            <Route path="/profile/:username" element={<ProtectedRoute element={<><Header /><UserDashboard /></>} authRequired={true} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
