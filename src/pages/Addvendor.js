import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc,} from "firebase/firestore";
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import "./css/Vendor.css"

function Addvendor() {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(true);
  const [nextVenId, setNextvenid] = useState('');

  const [vendor, setVendor] = useState({
    VenId: '', name: '', phone: '', type: '',
    email: '', address: '', bankName: '',
    bankAccName: '', bankAccNo: '',
  });

  // handleChange เกี่ยวกับการเปลี่ยนแปลง,อัปเดตค่าของ vendor
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  //fetchLatestDocumentId ดึงข้อมูล id vendor ล่าสุด
  useEffect(() => {
    const fetchLatestDocumentId = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vendor'));
        let maxVendor = 0;
        querySnapshot.forEach(doc => {
          const currentVendor = parseInt(doc.id.substr(3));
          if (currentVendor > maxVendor) {
            maxVendor = currentVendor;
          }
        });
        const nextVenId = `ven${String(maxVendor + 1).padStart(4, '0')}`;
        setNextvenid(nextVenId); 
      } catch (error) {
        console.error('Error fetching latest document ID: ', error);
      }
    };
    fetchLatestDocumentId();
  }, []);

//Addvendor
  const addVendor = async (e) => {
    e.preventDefault();
    try {
      if (!vendor.type || !vendor.phone || !vendor.name || !vendor.email || !vendor.address 
        || !vendor.bankName || !vendor.bankAccName || !vendor.bankAccNo) {
        throw new Error('All fields are required.');
      }

      const venRef = collection(db, 'vendor');

      await setDoc(doc(venRef, nextVenId), {
        type: vendor.type,
        phone: vendor.phone,
        name: vendor.name,
        email: vendor.email,
        address: vendor.address,
        bankName: vendor.bankName,
        bankAccName: vendor.bankAccName,
        bankAccNo: vendor.bankAccNo,
      });
      
      const fetchLatestDocumentId = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'vendor'));
          const documentCount = querySnapshot.size;
          const nextVenId = `ven${String(documentCount + 1).padStart(4, '0')}`;
          setNextvenid(nextVenId);
        } catch (e) {
          console.log("Error", e);
        }
      };

      fetchLatestDocumentId();

      setVendor({
        VenId: '', name: '', phone: '', type: '',
        email: '', address: '', bankName: '',
        bankAccName: '', bankAccNo: '',
      });

      navigate("/Vendorlist");
      alert("Add successful ");
    } catch (e) {
      alert("Add fail,Please fill in complete information. ");
      console.log("error", e);
    }
  };

 //CanCel จะล้างข้อมูลทั้งหมดใน vendor
  const CancelVendor = () => {
    setVendor({
      name: '', phone: '', type: '', 
      email: '', address: '', bankName: '',
      bankAccName: '', bankAccNo: '',
    });
  };

 //Back  
  const handleGoBack = () => {
    navigate(`/Vendorlist`);
  };


  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <form>
        <div className='headerven'>
          <button className="back-btnvenadd" onClick={handleGoBack}>&lt;</button>
          <h1 className='HeadVendor'>Add vendor</h1>
        </div>
        <section className='app-section'>
          <div className='app-container'>
            <div className='box'>
              <div className="ven-in">
                <b>Vendor</b>
                <div className="VenIdAdd">
                  <label htmlFor="VenId">VendorID</label>
                  <input
                    type='text'
                    name='VenId'
                    value={nextVenId}
                    onChange={handleChange} />
                </div>
                <div className="VenTypeAdd">
                  <label htmlFor="type">Vendor Type</label>
                  <select
                    name="type"
                    value={vendor.type}
                    onChange={handleChange}>
                    <option selected>Select Type</option>
                    <option>Company</option>
                    <option>Individuals</option>
                  </select>
                </div>
                <div className="VenPhoneAdd">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type='tel'
                    name='phone'
                    value={vendor.phone}
                    onChange={handleChange} />
                </div>
              </div>


              <div className="ven-in2">
                <div className="VenName">
                  <label htmlFor="name">Name</label>
                  <input
                    type='text'
                    name='name'
                    value={vendor.name}
                    onChange={handleChange} />
                </div>
                <div className='VenEmail'>
                  <label htmlFor="email">Email</label>
                  <input
                    type='email'
                    name='email'
                    value={vendor.email}
                    onChange={handleChange} />
                </div>
              </div>
              <div className='VenAdd'>
                <label htmlFor='address'>Address</label>
                <textarea
                  rows='4'
                  cols={40}
                  type='text'
                  name='address'
                  value={vendor.address}
                  onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>


        <section className='app-section'>
          <div className='app-container'>
            <div className='box'>
              <div className="Bank-in">
                <b>Bank information</b>
                <div className="BName">
                  <label htmlFor="bankName">Bank Name</label>
                  <select
                    name="bankName"
                    value={vendor.bankName}
                    onChange={handleChange}>
                    <option selected>Select Bank Name</option>
                    <option>KBank</option>
                    <option>SCB</option>
                    <option>BBL</option>
                  </select>
                </div>
                <div className='BAccName'>
                  <label htmlFor='bankAccName'>Bank Account Name</label>
                  <input
                    type='text'
                    name='bankAccName'
                    value={vendor.bankAccName}
                    onChange={handleChange} />
                </div>
              </div>

              <div className='BAccNo'>
                <label htmlFor='bankAccNo'>Bank Account Number</label>
                <input
                  type='text'
                  name='bankAccNo'
                  value={vendor.bankAccNo}
                  onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

      </form>
      <footer className="FooterVendor">
        <div className="footer-manageVendor">
          <div>
            <label><b>VendorID :</b> {nextVenId}</label>
          </div>

          <div className="CancleVendorfoot">
            <button className="CancelButtonVendor" onClick={CancelVendor}>Cancle</button>
          </div>
          <div className="AddButtonVendor">
            <button type="Submit" onClick={addVendor}>Add vendor</button>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default Addvendor;
