import React, { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import "./css/Vendor.css";

const data ={
  VenId:'', VenType:'', VenPhone:'', VenName:'', VenEmail:'', VenAdd:'',
  BName:'', BAccName:'', BAccNum:''

}
function Editvendor(){
  const navigate = useNavigate();
    const [input,setInput] = useState(data);

    
  const [allInput, setallinput] = useState([]);

    function handleChange(event){
        const{name, value} = event.target;
        setInput((prevInput) =>{
            return{
                ...prevInput,[name]:value
            }
        });
    }

    function oninputSubmit (event){
      event.preventDefault();
      // var myHeaders = new Headers();
      // myHeaders.append("Content-Type","application/json");
      // var raw = JSON.stringify({
      //   "VenId": VenId,
      //   "VenType": VenType,
      //   "VenPhone": VenPhone,
      //   "VenName":VenName,
      //   "VenEmail":VenEmail,
      //   "VenAdd":VenAdd,
      //   "BName":BName,
      //   "BAccName":BAccName,
      //   "BAccNum":BAccNum

      // });
      // var requestOptions ={
      //   method: 'POST',
      //   headers: myHeaders,
      //   body: raw,
      //   redirect:'follow'
      // }

      setallinput((prevallinput) =>{
        return [input, ...prevallinput];

        
      });

      // setInput(data);
      console.log(input);
    }

   

    return (
        <div>
          <Navbar />
          <h1 className='Head'>Edit vendor</h1>
          <form onSubmit={oninputSubmit}>
          <section className='app-section'>
            <div className='app-container'>
              <div className='box'>

              <div className="ven-in">
              Vendor
              <div className="VenId">
                <label htmlFor="VenId">VendorID</label>
                <input
                      type='text'
                      name='VenId'
                      value={input.VenId}
                      onChange={handleChange} />
              </div>
              <div className="VenType">
                <label htmlFor="VenType">Vendor Type</label>
                <select class="form-select" aria-label="Default select example" id="VenType" onChange={handleChange}>
                      <option selected>Open this select menu</option>
                      <option>Company</option>
                      <option>Individuals</option>
                    </select>
              </div>
              <div className="VenPhone">
                <label htmlFor="VenPhone">Phone Number</label>
                <input
                    type='tel'
                    name='VenPhone'
                    value={input.VenPhone}
                    onChange={handleChange} />
              </div>
            </div>
            <div className="ven-in2">
              
              <div className="VenName">
                <label htmlFor="VenName">Name</label>
                <input
                    type='text'
                    name='VenName'
                    value={input.VenName}
                    onChange={handleChange} />
              </div>
              <div className='VenEmail'>
                    <label htmlFor="VenEmail">Email</label>
                    <input
                      type='email'
                      name='VenEmail'
                      value={input.VenEmail}
                      onChange={handleChange} />
              </div>
            </div>
                  <div className='VenAdd'>
                    <label htmlFor=''>Address</label>
                    <textarea
                    rows='5'
                    cols={40}
                    type='text'
                    name='VenAdd'
                    value={input.VenAdd}
                    onChange={handleChange} />
                  </div>
              </div>
            </div>
          </section>

          <section className='app-section'>
            <div className='app-container'>
              <div className='box'>
              <div className="Bank-in">
              Bank information
              <div className="BName">
                <label htmlFor="BName">Bank Name</label>
                <select class="form-select" aria-label="Default select example" id="BName" onChange={handleChange}>
                    <option selected>Open this select menu</option>
                    <option>KBank</option>
                    <option>SCB</option>
                    <option>BBL</option>
                  </select>
              </div>
              <div className='BAccName'>
                    <label htmlFor=''>Bank Account Name</label>
                    <input
                    type='text'
                    name='BAccName'
                    value={input.BAccName}
                    onChange={handleChange} />
                  </div>
            </div>
              
                  <div className='BAccNum'>
                    <label htmlFor=''>Bank Account Number</label>
                    <input
                      type='text'
                      name='BAccNum'
                      value={input.BAccNum}
                      onChange={handleChange} />
                  </div>
                
              </div>
            </div>
          </section>
          </form>
          
          {/* <footer className="Footer">
          <hr></hr>
          <div className="footer-manage">
            <div>
              <label>VendorID </label>
            </div>

            <div className="Button">
              <div className="Cancle">
                <button className="Cancel-Button">Cancle</button>
              </div>
              <div className="AddButton">
                <button type="Submit">Save</button>
              </div>
            </div>
          </div> */}
        {/* </footer> */}

<section className='app-section'>
            <div className='app-container'>
              <div className='box'>
              <div className="vid">
              <div>
            <label>VendorID {}</label>
          </div>

          <div className="Button">
            <div className="Cancle">
              <button className="CancelButton">Cancle</button>
            </div>
            <div className="SaveButton">
              <button type="Submit">Save</button>
            </div>
          </div>
        </div>
          </div>
          </div>
          </section>

        </div>
      );
}

export default Editvendor;