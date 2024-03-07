import './App.css';
import Login from './Login';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';

function App() {
  return (
    <div >
        {/* <Login/> */}

        <Routes>
          <Route path='/' element = {<Login/>}></Route>
          <Route path='/Home' element = {<Home/>}></Route>
        </Routes>
    </div>
  );
}

export default App;
