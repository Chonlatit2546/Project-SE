import './App.css';
import Login from './Login';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Createquotation from './Createquotation';
import Addvendor from './Addvendor';
import Navbar from './components/Navbar';
import Editquotation from './Editquotation';
import Purchaseorder from './Purchaseorder';
import AddProduct from './AddProduct';

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
        </Routes>
    </div>
    
  );
}

export default App;
