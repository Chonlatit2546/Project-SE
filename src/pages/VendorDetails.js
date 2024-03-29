import Navbar from '../components/Navbar';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./css/Vendor.css"

function VendorDetails() {
    const [vendor, setVendor] = useState(null);
    const { id } = useParams();
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

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "vendor", id));
            setVendor(vendor.filter((item) => item.id !== id));
        } catch (err) {
            console.log(err);
        }
    };

    return (

        <div>
            {/* <Navbar /> */}
            <h1 className='Head'>Vendor list - {id}</h1><section className='app-section'>
                <div className="options-dropdown">
                    <button className="options-btn">Options</button>
                    <div className="options-dropdown-content">
                        <Link to={`/Editvendor/${id}`} className="options-btn edit-btn">Edit Vendor</Link>
                        <button onClick={() => handleDelete(id)} className="options-btn cancel-btn">Delete Vendor</button>
                    </div>
                </div>
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


