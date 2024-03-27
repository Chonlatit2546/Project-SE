import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import "./css/Vendor.css"

function Addvendor() {
  const navigate = useNavigate();
  const [nextVenId, setNextvenid] = useState('');
  const [vendor, setVendor] = useState({
    VenId: '',
    name: '',
    phone: '',
    type: '',
    email: '',
    address: '',
    bankName: '',
    bankAccName: '',
    bankAccNo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor((prevInput) => ({
      ...prevInput,
      [name]: value,

    }));
  };


  useEffect(() => {
    const fetchLatestDocumentId = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vendor'));
        const documentCount = querySnapshot.size;
        const nextVenId = `ven${String(documentCount + 1).padStart(4, '0')}`;
        setNextvenid(nextVenId);
      } catch (error) {
        console.error('Error fetching latest document ID: ', error);
      }
    };
    fetchLatestDocumentId();
  }, []);


  const addVendor = async (e) => {
    e.preventDefault();

    try {
      if (!vendor.type || !vendor.phone || !vendor.name || !vendor.email || !vendor.address || !vendor.bankName || !vendor.bankAccName || !vendor.bankAccNo) {
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
        VenId: '',
        name: '',
        phone: '',
        type: '',
        email: '',
        address: '',
        bankName: '',
        bankAccName: '',
        bankAccNo: '',
      });

      navigate("/Vendorlist");
      alert("add successful");
    } catch (e) {
      alert("add fail");
      console.log("error", e);
    }
  };



  const Cancel = () => {
    setVendor({
      VenId: '',
      name: '',
      phone: '',
      type: '',
      email: '',
      address: '',
      bankName: '',
      bankAccName: '',
      bankAccNo: '',
    });
  };


  return (
    <div>
      <Navbar />
      <h1 className='Head'>Add vendor</h1>
      <form>
        <section className='app-section'>
          <div className='app-container'>
            <div className='box'>
              <div className="ven-in">
              <b>Vendor</b>
                <div className="VenId">
                  <label htmlFor="VenId">VendorID</label>
                  <input
                    type='text'
                    name='VenId'
                    value={nextVenId}
                    onChange={handleChange}
                  />
                </div>
                <div className="VenType">
                  <label htmlFor="type">Vendor Type</label>
                  <select
                    class="form-select"
                    aria-label="Default select example"
                    name="type"
                    value={vendor.type}
                    onChange={handleChange} >
                    <option selected>Open this select menu</option>
                    <option>Company</option>
                    <option>Individuals</option>
                  </select>
                </div>
                <div className="VenPhone">
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
                    class="form-select"
                    aria-label="Default select example"
                    name="bankName"
                    value={vendor.bankName}
                    onChange={handleChange} >
                    <option selected>Open this select menu</option>
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

      <section className='app-section'>
        <div className='app-container'>
          <div className='box'>
            <div className="vid">
              <div>
              <label><b>VendorID :</b> {nextVenId}</label>
              </div>

              <div className="Button" text>
                <div className="Cancle">
                  <button className="CancelButton" onClick={Cancel}>Cancle</button>
                </div>
                <div className="AddButton">
                  <button type="Submit" onClick={addVendor}>Add vendor</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Addvendor;
