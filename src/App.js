import './App.css';
import Login from './Login';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Createquotation from './Createquotation';
import Addvendor from './Addvendor';
<<<<<<< HEAD
import Navbar from './components/Navbar';

=======
import Editquotation from './Editquotation';
>>>>>>> 09016b78d75b2a971edaefd2a18a05bbdb006a1f
function App() {
  return (
    <div >
        {/* <Login/> */}

        <Routes>
          <Route path='/' element = {<Login/>}></Route>
          <Route path='/Home' element = {<Home/>}></Route>
          <Route path='/Navbar' element = {<Navbar/>}></Route>
          <Route path='/Createquotation' element = {<Createquotation/>}></Route>
          <Route path='/Addvendor' element = {<Addvendor/>}></Route>
          <Route path='/Editquotation' element = {<Editquotation/>}></Route>
        </Routes>
    </div>
    
  );
}

export default App;
