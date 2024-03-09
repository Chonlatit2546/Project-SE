import React, { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';

const data ={
  VenId:'', VenType:'', VenPhone:'', VenName:'', VenEmail:'', VenAdd:'',
  BName:'', BAccName:'', BAccNum:''
}

function Addvendor(){
  // const navigate = useNavigate();
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

    function oninputSubmit(event){
      event.preventDefault();

      setallinput((prevallinput) =>{
        return [...prevallinput, input];
      });


      //console.log(input);
    }

   

    return (
        <form onSubmit={oninputSubmit}>
            <h1>Addvendor</h1>

          <div className="idtypepho-box">
          <p>
            Vendor
            VendorID
            <input
                type='text'
                name='VenId'
                value={input.VenId}
                onChange={handleChange}
                />
              <label for="sel1" class="form-label">Vendor Type</label>
              <select class="form-select" aria-label="Default select example" id="VenType" onChange={handleChange}>
              <option selected>Open this select menu</option>
              <option>Company</option>
              <option>Individuals</option>
            </select>



                {/* Vendor Type
                <input
                type='text'
                name='VenType'
                value={input.VenType}
                onChange={handleChange} 
                />  */}
                Phone Number
                <input
                type='tel'
                name='VenPhone'
                value={input.VenPhone}
                onChange={handleChange}
                
                /> 
            </p>
          </div>
          <div className="namemail-box">
          <p>
            Name
            <input
                type='text'
                name='VenName'
                value={input.VenName}
                onChange={handleChange}
                />
                <label for="email">Email:</label>
                <input
                type='email'
                name='VenEmail'
                value={input.VenEmail}
                onChange={handleChange} 
                /> 
                
            </p>
          </div>
          <div className='add-box'>
            <p>
                Address
                <textarea
                    rows='3'
                    type='text'
                    name='VenAdd'
                    value={input.VenAdd}
                    onChange={handleChange}
                />
            </p>
          </div>

          <div className='bank-box'>
            <p>
                Bank information
                
              <label for="sel1" class="form-label">Bank Name</label>
              <select class="form-select" aria-label="Default select example" id="BName" onChange={handleChange}>
              <option selected>Open this select menu</option>
              <option>KBank</option>
              <option>SCB</option>
              <option>BBL</option>

            </select>


                Bank Account Name
                <input
                    type='text'
                    name='BAccName'
                    value={input.BAccName}
                    onChange={handleChange}
                />
            </p>
          </div>
          <div className='Bnum-box'>
            <p>
            Bank Account Number
                <input
                    type='text'
                    name='BAccNum'
                    value={input.BAccNum}
                    onChange={handleChange}
                />
            </p>
          </div>
 
    
          <br />
    
          <div>
            <a button type="button" href = "./Vendorlist">
              Cancel
            </a>
            <button type="submit" >
              Add Vendor
            </button>
          </div>
        </form>

      );
}

    


export default Addvendor;
