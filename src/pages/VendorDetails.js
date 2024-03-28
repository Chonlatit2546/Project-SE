import Navbar from '../components/Navbar';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./css/Vendor.css"

function VendorDetails() {
    const { id } = useParams();

    const [vendor, setVendor] = useState(null);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const docRef = doc(db, "vendor", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setVendor(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchVendor();
    }, [id]);
    console.log("Vendor Data:", vendor);

    if (!vendor) {
        return <div>Loading...</div>;
    }

    return (

        <div><h1 className='Head'>Vendor list - {id}</h1><section className='app-section'>
            <div className='app-container'>
                <div className='box'>
                    <div className="ven-in">
                        Vendor
                        <div className="VenId">
                            <label htmlFor="VenId">VendorID  <br />{id}</label>
                        </div>
                        <div className="VenType">
                            <label htmlFor="type">Vendor Type {vendor.type}</label>
                        </div>
                        <div className="VenPhone">
                            <label htmlFor="phone">Phone Number {vendor.phone}</label>
                        </div>
                    </div>

                    <div className="ven-in2">
                        <div className="VenName">
                            <label htmlFor="name">Name: {vendor.name}</label>
                        </div>
                        <div className='VenEmail'>
                            <label htmlFor="email">Email {vendor.email}</label>
                        </div>

                        <div className='VenAdd'>
                            <label htmlFor='address'>Address {vendor.address}</label>
                        </div>
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
                                <label htmlFor="bankName">Bank Name {vendor.bankName}</label>

                            </div>
                            <div className='BAccName'>
                                <label htmlFor='bankAccName'>Bank Account Name{vendor.bankAccName}</label>

                            </div>
                        </div>

                        <div className='BAccNo'>
                            <label htmlFor='bankAccNo'>Bank Account Number  {vendor.bankAccNo}</label>

                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};
export default VendorDetails;


