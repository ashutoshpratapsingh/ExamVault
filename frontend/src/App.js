import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamPage from "./pages/ExamPage";
import Admin from './pages/Admin';
import ExaminerPanel from "./pages/ExaminerPanel";
import Result from './pages/Result';
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

console.log("🔥 NEW EXAMINER PANEL LOADED");

function App(){
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>

        {/* MAIN */}
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/exam/:id' element={<ExamPage/>}/>
        <Route path='/result' element={<Result/>}/>

        {/* ADMIN */}
        <Route path='/admin' element={<Admin/>}/>

        {/* EXAMINER */}
        <Route path="/examiner" element={<ExaminerPanel />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;