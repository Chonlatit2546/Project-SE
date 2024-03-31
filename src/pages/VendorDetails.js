import Navbar from '../components/Navbar';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { IoChevronBack } from "react-icons/io5";
import "./css/VendorDetails.css"

function VendorDetails() {
    const [menuActive, setMenuActive] = useState(true);
    const [vendor, setVendor] = useState(null);
    const { id } = useParams();

//ดึงข้อมูล Vendor
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

    if (!vendor) {
        return <div>Loading...</div>;
    }

//Delect
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Vendor?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "vendor", id));
                setVendor(vendor.filter((item) => item.id !== id));
            } catch (err) {
                console.log(err);
            }
        }
    };

//Back
    const handleGoBack = () => {
        window.location.href = '/Vendorlist';
    };

    return (

        <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
            <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
            <div>
                <div className='headerven'>
                <IoChevronBack className="back-btnven" onClick={handleGoBack} />
                    <h1 className='HeadVendorDe'>Vendor list - {id}</h1>
                </div>
                <section className='app-sectionDe'>
                    <div className="button-container-vendor">
                        <div className="options-dropdown-vendor">
                            <button className="options-btn-vendor">Options</button>
                            <div className="options-dropdown-content-vendor">
                                <Link to={`/Editvendor/${id}`} className="options-btn-vendor edit-btn-vendor">Edit Vendor</Link>
                                <button onClick={() => handleDelete(id)} className="options-btn-vendor delete-btn-vendor">Delete Vendor</button>
                            </div>
                        </div>
                    </div>
                    <div className="ID-Vendor">
                        VendorID {id}</div>
                    <div className='app-containerDe'>
                        <div className='boxDe'>
                            <div className="ven-inDe">
                                <b>Vendor</b>
                                <div className="VenIdDe">
                                    <label htmlFor="VenId">VendorID : </label>
                                    <label className='IdD'>{id}</label>
                                </div>

                                <div className="VenTypeDe">
                                    <label htmlFor="type">Vendor Type : </label>
                                    <label className='VenTypeD'>{vendor.type}</label>
                                </div>
                                <div className="VenPhoneDe">
                                    <label htmlFor="phone">Phone Number : </label>
                                    <label className='VenPhoneD'>{vendor.phone}</label>
                                </div>
                            </div>

                            <div className="ven-in2De">
                                <div className="VenNameDe">
                                    <label htmlFor="name">Name : </label>
                                    <label className='NameD'>
                                        {vendor.name}
                                    </label>
                                </div>
                                <div className='VenEmailDe'>
                                    <label htmlFor="email">Email : </label>
                                    <label className='VenEmailD'>{vendor.email}</label>
                                </div>
                            </div>

                            <div className='VenAddDe'>
                                <label htmlFor='address'>Address : </label>
                                <label className='VenAddD'>{vendor.address}</label>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='app-sectionDe'>
                    <div className='app-containerDe'>
                        <div className='boxDe2'>
                            <div className="Bank-inDe">
                                <b>Bank information</b>
                                <div className="BNameDe">
                                    <label htmlFor="bankName">Bank Name : </label>
                                    <label className='BNameD'>{vendor.bankName}</label>

                                </div>
                                <div className='BAccNameDe'>
                                    <label htmlFor='bankAccName'>Bank Account Name : </label>
                                    <label className='BAccNameD'>{vendor.bankAccName}</label>

                                </div>
                            </div>
                            <div className='BAccNoDe'>
                                <label htmlFor='bankAccNo'>Bank Account Number : </label>
                                <label className='BAccNoD'>
                                    {vendor.bankAccNo}
                                </label>

                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
export default VendorDetails;