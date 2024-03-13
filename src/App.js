import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Createquotation from './pages/Createquotation';
import Addvendor from './pages/Addvendor';
import Navbar from './components/Navbar';
import Editquotation from './pages/Editquotation';
import Purchaseorder from './pages/Purchaseorder';
import AddProduct from './pages/AddProduct';
import Editvendor from './pages/Editvendor';

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
          <Route path='/Purchaseorder' element = {<Purchaseorder/>}></Route>
          <Route path='/AddProduct' element = {<AddProduct/>}></Route>
          <Route path='/Editvendor' element = {<Editvendor/>}></Route>
        </Routes>
    </div>
    
  );
}

export default App;
