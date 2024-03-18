import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
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
import SearchReceipt from './pages/SearchReceipt';
import CreateReceipt from './pages/CreateReceipt';
import { UserProvider } from './pages/UserContext'; 

function App() {
  return (
    <div >
        {/* <Login/> */}
      <UserProvider>
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
          <Route path='/CreateReceipt' element = {<CreateReceipt/>}></Route>
          <Route path='/SearchReceipt' element = {<SearchReceipt/>}></Route>
        </Routes>
    </UserProvider>
    </div>
    
  );
}

export default App;
