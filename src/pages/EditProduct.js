import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import "./css/EditProduct.css";
import { IoIosAddCircle } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";



function EditProduct() {

  const navigate = useNavigate(); //navigate  ใช้สำหรับการเปลี่ยนหน้า

  const { id } = useParams(); // รับ id ที่ส่งมา

  const [menuActive, setMenuActive] = useState(true); //state สำหรับ NavBar
  
  //state สำหรับ product
  const [product, setProduct] = useState({ 
    productName: "",
    material: "",
    color: "",
    size: "",
    unit: "",
  });
  
  //state สำหรับเก็บค่าเริ่มต้นของ Product เพื่อนำไว้ใช้ตอน user กด cancel
  const [initialProductData, setInitialProductData] = useState(null);

  //state สำหรับ productOwn
  const [productOwn, setProductOwn] = useState([]);

  //state สำหรับเก็บค่าเริ่มต้นของ ProductOwn เพื่อนำไว้ใช้ตอน user กด cancel
  const [initialProductOwnData, setInitialProductOwnData] = useState(null);

  //state สำหรับเมื่อมีการเพิ่ม ProductOwn
  const [AddProductOwn, setAddProductOwn] = useState([]);

  //state สำหรับเมื่อมีการลบ ProductOwn
  const [deleteProductOwn_buffer, setDeleteProductOwn] = useState([]);

  //------------------------------------------- Action สำหรับ ปุ่มกดกลับไปหน้า ViewProduct -----------------------------------------------
  const GoBack = () => {
    navigate(`/ViewProduct/${id}`);
  };

  useEffect(() => {

    //--------------------------------------------- ดึงข้อมูล Product ---------------------------------------------------------------------
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "product", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct(docSnap.data());
          setInitialProductData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    //-------------------------------------------------ดึงข้อมูล ProductOwn -------------------------------------------------------------
    const fetchProductOwn = async () => {
      try {
        const productOwnsCollectionRef = collection(db, "productOwn");
        const productOwnsSnapshot = await getDocs(productOwnsCollectionRef);
        const newProductOwn = [];
        productOwnsSnapshot.docs.forEach(async (doc) => {
          const data = doc.data();
          const productIdRef = data.prodID;
          const venIDRef = data.venID;

          if (productIdRef.id === id) {
            newProductOwn.push({
              id: doc.id,
              venID: venIDRef,
              savedDate: data.savedDate,
              unitPrice: data.unitPrice,
            });
          }
          
        });

        setProductOwn(newProductOwn);
        setInitialProductOwnData(newProductOwn);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchProductOwn();
    fetchProduct();
  }, [id]);


  //--------------------------------------------จัดการกับการเปลี่ยนแปลงค่าใน input field ของ product------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  

  //---------------------------------------------- จัดการกับการเปลี่ยนแปลงค่าใน input field ของ productOwn ----------------------------------
  const handleProductOwnChange = (e, index) => {
    const updatedProductOwns = [...productOwn];
    const { name, value } = e.target;

    updatedProductOwns[index] = {
      ...updatedProductOwns[index],
      [name]: value,
    };
    console.log("updatedProductOwns", updatedProductOwns);
    setProductOwn(updatedProductOwns);
  };

  //------------------------------------------------ Action สำหรับเมื่อมีการกดเพิ่ม ProductOwn ---------------------------------------------
  const addProductOwn = () => {
    setAddProductOwn([
      ...AddProductOwn,
      {
        venID: "",
        savedDate: "",
        unitPrice: "",
        prodID: id,
      },
    ]);
  };

  //-------------------------------------------- จัดการกับการเปลี่ยนแปลงค่าใน input field ของ AddProductOwn--------------------------------
  const handleAddProductOwnChange = (e, index) => {
    const { name, value } = e.target;
    setAddProductOwn((prevAddProductOwn) => {
      return prevAddProductOwn.map((item, i) => {
        if (i === index) {
          return { ...item, [name]: value };
        }
        return item;
      });
    });
  };

  //------------------------------------------------ Action สำหรับเมื่อกดปุ่ม Delete AddProductOwn -----------------------------------------
  const deleteAddProductOwn = (index) => {
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns.splice(index, 1);
    setAddProductOwn(updatedProductOwns);
  };


  // -------------------------------------------------- Action สำหรับเมื่อกดปุ่ม Delete ProductOwn ----------------------------------------
  const deleteProductOwn = (item, index) => {
    const productOwnToDelete = item;

    // ลบรายการที่ต้องการลบออกมาจากอาร์เรย์ productOwn
    const updatedProductOwns = productOwn.filter(
      (product, idx) => idx !== index
    );

    // เพิ่มรายการที่ต้องการลบเข้าไปใน buffer
    setDeleteProductOwn([...deleteProductOwn_buffer, productOwnToDelete]);

    // อัพเดท state ของ productOwn ด้วยรายการที่อัพเดทแล้ว
    setProductOwn(updatedProductOwns);
  };

  // ----------------------------------------------------Action สำหรับเมื่อกดปุ่ม Cancel -------------------------------------------------
  const cancel = () => {
    if (initialProductData) {
      // กลับค่า product ให้เป็นค่าเริ่มต้น
      setProduct(initialProductData);
    }

    if (initialProductOwnData) {
      setProductOwn(initialProductOwnData);
    }

    setAddProductOwn([]);
    setDeleteProductOwn([]);
  };

  // ------------------------------------------------------ Action สำหรับเมื่อกดปุ่ม Save--------------------------------------------------
  const save = async () => {
    
      // กำหนดข้อความที่จะแสดงในกล่องข้อความยืนยัน
      const confirmMessage = "ยืนยันการบันทึกข้อมูล?";

      // ใช้ window.confirm() เพื่อแสดงกล่องข้อความยืนยัน
      const confirmed = window.confirm(confirmMessage);

      if (confirmed) {
        try{
          // อัพเดทข้อมูลของ product
      const productDocRef = doc(db, "product", id);
      await updateDoc(productDocRef, product);

      // อัพเดทข้อมูลของ productOwn
      const productOwnsCollectionRef = collection(db, "productOwn");
      const batch = writeBatch(db);

      productOwn.forEach((item, index) => {
        console.log("item.id", item.id);
        const productOwnID = item.id;

        const productOwnRef = doc(db, "productOwn", productOwnID);
        const vendorRef = item.venID;
        
        console.log("vendorRef", vendorRef);

        const productOwn_update = {
          venID: vendorRef,
          savedDate: item.savedDate,
          unitPrice: item.unitPrice,
        };

        const productOwnDocRef = doc(productOwnsCollectionRef, productOwnID);

        batch.update(productOwnDocRef, productOwn_update);
      });

      // ตรวจสอบว่ามีข้อมูลใน deleteProductOwn_buffer หรือไม่
      if (deleteProductOwn_buffer.length > 0) {
        const deleteBatch = writeBatch(db);
        deleteProductOwn_buffer.forEach(async (item) => {
          const docRef = doc(db, "productOwn", item.id);
          deleteBatch.delete(docRef);
        });
        await deleteBatch.commit();
      }

      if (AddProductOwn.length > 0) {
        // เพิ่มข้อมูลของ Product Own ที่ถูกเพิ่มเข้ามาผ่านอินพุตฟิลด์
        await Promise.all(
          AddProductOwn.map(async (productOwn, index) => {
            const productOwnDoc = await getDocs(collection(db, "productOwn"));

            let maxProductOwnID = 0;
            productOwnDoc.forEach((doc) => {
              console.log(doc.id);
              const currentProductOwnID = parseInt(doc.id.match(/\d+/)[0]); 
              if (currentProductOwnID > maxProductOwnID) {
                maxProductOwnID = currentProductOwnID;
              }
            });

            const newProductOwnID = `pdv${String(
              maxProductOwnID + index + 1
            ).padStart(4, "0")}`;

            const productOwnCollectionRef = collection(db, "productOwn");

            const productDocRef = doc(db, "product", productOwn.prodID);
            const vendorDocRef = doc(db, "vendor", productOwn.venID);

            console.log("newProductOwnID", newProductOwnID);

            await setDoc(doc(productOwnCollectionRef, newProductOwnID), {
              prodID: productDocRef,
              venID: vendorDocRef,
              savedDate: productOwn.savedDate || "",
              unitPrice: productOwn.unitPrice || "",
            });
          })
        );
      }

      await batch.commit();

      alert("Data updated successfully");
      console.log("Data updated successfully");

      window.location.href = `/EditProduct/${id}`;
        }catch(error){
          alert("Error updating data: ", error);
      console.error("Error updating data: ", error);
        }


      }

  };

  //สำหรับ Debugging
  console.log("product", product);
  console.log("productOwn", productOwn);
  console.log("delete product buffer", deleteProductOwn_buffer);
  console.log("AddProductOwn", AddProductOwn);


  //------------------------------------------------------------ H T M L -------------------------------------------------------------
  return (
    <div
      className={`container ${menuActive ? "menu-inactive" : "menu-active"}`}
    >
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />

      <div className="EditProduct-form">
        <div className="EditProduct-Head-manage">
          <IoChevronBack className="backButton" onClick={GoBack} />
          <h1 className="Edit-Head-Topic">Edit product-{id}</h1>
        </div>
        <form>
          <div className="Edit-Product-part">
            <div className="Edit-Product-info">
              Product
              <div className="Edit-Product-ID">
                <label htmlFor="productID">ProductID</label>
                <input type="text" id="productID" value={id} />
              </div>
              <div className="Edit-Product-Name">
                <label htmlFor="productName">Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  onChange={handleChange}
                  value={product.productName || ""}
                />
              </div>
            </div>
            <div className="Edit-Description">
              Description
              <div className="Edit-Material">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  onChange={handleChange}
                  value={product.material || ""}
                />
              </div>
              <div className="Edit-Color">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  onChange={handleChange}
                  value={product.color || ""}
                />
              </div>
              <div className="Edit-Size">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  onChange={handleChange}
                  value={product.size || ""}
                />
              </div>
              <div className="Edit-Unit">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  onChange={handleChange}
                  value={product.unit || ""}
                />
              </div>
            </div>
          </div>
          <div className="Edit-Product-Own">
            <div className="Edit-Product-Own-Info">
              Product Own
              <div className="Edit-ProductOwn-item-manage">
                {productOwn.map(
                  (item, index) =>
                    item && (
                      <div key={index} className="Edit-ProductOwn-item">
                        <div className="Edit-VendorID">
                          <label htmlFor={`vendorID${index}`}>VendorID</label>
                          <input
                            type="text"
                            id={`vendorID${index}`}
                            value={item.venID.id}
                            name="venID"
                            readOnly
                          />
                        </div>
                        <div className="Edit-SavedDate">
                          <label htmlFor={`saveDate${index}`}>Saved Date</label>
                          <input
                            type="date"
                            id={`saveDate${index}`}
                            value={item.savedDate}
                            name="savedDate"
                            onChange={(e) => handleProductOwnChange(e, index)}
                          />
                        </div>
                        <div className="Edit-UnitPrice">
                          <label htmlFor={`unitPrice${index}`}>
                            Unit Price
                          </label>
                          <input
                            type="text"
                            id={`unitPrice${index}`}
                            value={item.unitPrice}
                            name="unitPrice"
                            onChange={(e) => handleProductOwnChange(e, index)}
                          />
                        </div>
                        <div className="ProductOwn-Delete">
                          <button
                            type="button"
                            className="ProductOwn-Delete-Button"
                            onClick={() => deleteProductOwn(item, index)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                )}
              </div>
              <div className="Edit-AddmoreProductOwn">
                <IoIosAddCircle
                  onClick={addProductOwn}
                  className="Edit-AddmoreProductOwn-btn"
                />
                <label className="Edit-add">Add more Product Own</label>

                <div className="Edit-more-vendor">
                  {AddProductOwn.map((add_productOwn, index) => (
                    <div key={index} className="Edit-addVendor">
                      <div className="Edit-addVendorID">
                        <label htmlFor="vendorID">VendorID</label>
                        <input
                          type="text"
                          id="vendorID"
                          name="venID"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={add_productOwn.venID || ""}
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.vendorID}
                        />
                      </div>
                      <div className="Edit-AddSaveDate">
                        <label htmlFor="saveDate">Saved Date</label>
                        <input
                          type="date"
                          id="saveDate"
                          name="savedDate"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={add_productOwn.savedDate || ""}
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.saveDate}
                        />
                      </div>
                      <div className="Edit-AddUnitPrice">
                        <label htmlFor="unitPrice">Unit Price</label>
                        <input
                          type="text"
                          id="unitPrice"
                          name="unitPrice"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={add_productOwn.unitPrice || ""}
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.unitPrice}
                        />
                      </div>
                      <button
                        className="Edit-Delete-addvendor"
                        type="button"
                        onClick={() => deleteAddProductOwn(index)}
                      >
                        Delete
                      </button>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="Edit-add-product-Footer">
        <div className="Edit-footer-manage">
          <div>
            <label>ProductID: {id}</label>
          </div>

          <div className="Edit-Submit-Button">
            <div className="Edit-Cancle">
              <button className="Edit-Cancel-Button" onClick={cancel}>
                Cancel
              </button>
            </div>
            <div className="Edit-Save-Product-Button">
              <button type="Save-product" onClick={save}>
                save
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default EditProduct;
