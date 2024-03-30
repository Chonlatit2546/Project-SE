import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import "./css/Vendor.css";


function Editvendor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [menuActive, setMenuActive] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState(null);

//ดึงข้อมูล Vendor
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const docRef = doc(db, "vendor", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVendor(docSnap.data());
          setFormData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchVendor();
  }, [id]);

//การอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลง
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

//ส่งข้อมูลเข้าไปในดาต้าเบส
  const handleSubmit = async () => {
    try {
      const docRef = doc(db, "vendor", id);
      await updateDoc(docRef, formData);
      setVendor(formData);
      navigate("/Vendorlist");
      alert("Update successful");
    } catch (e) {
      alert("Update fail");
      console.log("error", e);
    }
  };

  if (!vendor) {
    return  <div className="loading">Loading...</div>;
  }

  const CancelVendor = () => {
    navigate(`/VendorDetails/${id}`);
  };
  const handleGoBack = () => {
    navigate(`/VendorDetails/${id}`);
  };

  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <form>
        
      <div className='headerven'>
          <button className="back-btnvenadd" onClick={handleGoBack}>&lt;</button>
        <h1 className='HeadVendor'>Edit vendor - {id}</h1>
        </div>
        <section className='app-section'>
          <div className='app-container'>
            <div className='box'>
              <div className="ven-in">
                <b>Vendor</b>
                <div className="VenId">
                  <label htmlFor="VenId">VendorID</label>
                </div>
                <div className='Idedit'>
                <label htmlFor='Idedit'>{id}</label>
                </div>
                <div className="VenType">
                  <label htmlFor="type">Vendor Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange} >
                    <option selected>Select Type</option>
                    <option>Company</option>
                    <option>Individuals</option>
                  </select>
                </div>
                <div className="VenPhone">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange} />
                </div>
              </div>


              <div className="ven-in2">
                <div className="VenName">
                  <label htmlFor="name">Name</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange} />
                </div>
                <div className='VenEmail'>
                  <label htmlFor="email">Email</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className='VenAdd'>
                <label htmlFor='address'>Address</label>
                <textarea
                  rows='4'
                  cols={40}
                  type='text'
                  name='address'
                  value={formData.address}
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
                    value={formData.bankName}
                    onChange={handleChange} >
                    <option selected>Select Bank name</option>
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
                    value={formData.bankAccName}
                    onChange={handleChange} />
                </div>
              </div>

              <div className='BAccNo'>
                <label htmlFor='bankAccNo'>Bank Account Number</label>
                <input
                  type='text'
                  name='bankAccNo'
                  value={formData.bankAccNo}
                  onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>
        </form>
      <footer className="FooterVendor">
          <div className="footer-manageVendor">
            <div>
              <label><b>VendorID :</b> {id}</label>
            </div>

            <div className="CancleVendorfoot">
              <button className="CancelButtonVendor" onClick={CancelVendor}>Cancle</button>
            </div>
            <div className="SaveButtonVendor">
              <button type="Submit" onClick={handleSubmit}>Save vendor</button>
            </div>
          </div>
        </footer>
    </div >
  );
};

export default Editvendor;