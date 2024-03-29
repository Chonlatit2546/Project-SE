import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import "./css/Vendor.css";


function Editvendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
    return <div>Loading...</div>;
  }

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
      {/* <Navbar /> */}
      <h1 className='Head'>Edit vendor-{id}</h1>
      <form>
        <section className='app-section'>
          <div className='app-container'>
            <div className='box'>
              <div className="ven-in">
                <b>Vendor</b>
                <div className="VenId">
                  <label htmlFor="VenId">VendorID  <br />{id}</label>
                </div>
                <div className="VenType">
                  <label htmlFor="type">Vendor Type</label>
                  <select
                    class="form-select"
                    aria-label="Default select example"
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
                    class="form-select"
                    aria-label="Default select example"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange} >
                    <option selected>Select bank name</option>
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


      <section className='app-section'>
        <div className='app-container'>
          <div className='box'>
            <div className="vid">
              <div>
                <label><b>VendorID :</b> {id}</label>

              </div>

              <div className="Button" text>
                <div className="Cancle">
                  <button className="CancelButton" onClick={Cancel}>Cancle</button>
                </div>
                <div className="SaveButton">
                  <button type="Submit" onClick={handleSubmit}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Editvendor;