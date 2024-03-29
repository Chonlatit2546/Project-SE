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
import Vendorlist from './pages/Vendorlist';
import SearchReceipt from './pages/SearchReceipt';
import CreateReceipt from './pages/CreateReceipt';
import { UserProvider } from './pages/UserContext'; 
import QuotationDetails from './pages/QuotationDetails';
import Quotation from './pages/Quotation';
import VendorDetails from './pages/VendorDetails';
import Product_list from './pages/Product_list';
import ViewProduct from './pages/ViewProduct';

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
          <Route path='/Editvendor/:id' element = {<Editvendor/>}></Route>
          <Route path='/Vendorlist' element = {<Vendorlist/>}></Route>
          <Route path='/CreateReceipt' element = {<CreateReceipt/>}></Route>
          <Route path='/CreateReceipt/:id' element = {<CreateReceipt/>}></Route>
          <Route path='/SearchReceipt' element = {<SearchReceipt/>}></Route>
          <Route path='/QuotationDetails/:id' element={<QuotationDetails/>}></Route>
          <Route path='/Quotation' element={<Quotation/>}></Route>
          <Route path='/VendorDetails/:id' element={<VendorDetails/>}></Route>
          <Route path='/Product_list' element={<Product_list/>}></Route>
          <Route path='/ViewProduct/:id' element={<ViewProduct/>}></Route>
        </Routes>
    </UserProvider>
    </div>
    
  );
}

export default App;
