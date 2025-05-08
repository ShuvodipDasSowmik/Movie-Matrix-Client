import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './Components/ThemeToggle'

function App() {

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
