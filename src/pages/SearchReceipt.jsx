import Navbar from "../components/Navbar";
import React , { useState } from 'react';
import { Link } from 'react-router-dom';
import "./css/SearchReceipt.css";



function SearchReceipt() {

    

    const [inputValue, setInputValue] = useState('');

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <>
            <div>
                
                <Navbar />
                
                <div className="main">
                    <h1 className="s1" >Receipt</h1>
                    <Link to='/CreateReceipt'>
                        <button className="create-re-bt">Create Receipt</button>
                    </Link>

                    <div className="search-box">
                        <input
                            className="input"
                            placeholder='Search'
                            type="text"
                            value={inputValue}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="list-po">
                        <div className="title">
                            <p className="l1">PO Number</p>
                            <p className="l2">Customer</p>
                            <p className="l3">Issued Date</p>
                            <p className="l4">Amount</p>
                            <p className="l5">Receipt Status</p>
                        </div>

                        <div className="data">

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SearchReceipt;