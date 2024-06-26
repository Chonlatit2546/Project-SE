import React from "react";
import Navbar from "../components/Navbar";
import "./css/AddProduct.css";
import { IoIosAddCircle } from "react-icons/io";
import { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

function AddProduct() {
  const navigate = useNavigate(); //navigate  ใช้สำหรับการเปลี่ยนหน้า

   //state สำหรับ NavBar
  const [menuActive, setMenuActive] = useState(true);

  //state สำหรับ product
  const [product, setProduct] = useState({
    productID: "",
    productName: "",
    material: "",
    color: "",
    size: "",
    unit: "",
    vendorID: "",
    saveDate: "",
    unitPrice: "",
  });

  //state สำหรับคำนวณ productID
  const [newProductID, setNewProductID] = useState(""); 

  //state สำหรับคำนวณ productOwnID
  const [newProductOwnID, setNewProductOwnID] = useState(""); 

  //state สำหรับเพิ่ม ProductOwn
  const [AddProductOwn, setAddProductOwn] = useState([]);

  // ----------------------------------สำหรับกลับไปหน้า Product List--------------------------------------------------------------------
  const GoBack = () => {
    navigate("/Product_list");
  };


  useEffect(() => {


    // ---------------------------------คำนวณ procutID โดยการหา procutID ที่มากที่สุด ---------------------------------------------------------
    const checkAmountofProductDoc = async () => {
      try {

        const productDoc = await getDocs(collection(db, "product")); //ดึงข้อมูล product จาก Database 

        let maxProductID = 0; // Initial ค่า max ให้เป็น 0
        productDoc.forEach(doc => {  // วนลูปเพื่อหาตัวที่มีค่ามากที่สุด
          console.log(doc.id);
          const currentProductID = parseInt(doc.id.match(/\d+/)[0]); //ดึงส่วนของตัวเลขมาเก็บในcurrentProductID เช่น pd0005 -> 5
          if (currentProductID  > maxProductID) { //เปรียบเทียบค่าล่าสุด กับ ค่า max ถ้าค่าล่าสุดมากกว่าค่า max ก็จะให้ max = ค่าล่าสุด
            maxProductID = currentProductID;
          }
      });

      console.log("maxProductID",maxProductID);

      const newProductID = `pd${String(maxProductID + 1).padStart(4, "0")}`; //คำนวณ ProductID ตัวถัดไปโดยการนำค่า max มาบวก 1 
      console.log("newProductID",newProductID);

        setNewProductID(newProductID); // set newProductID State 
      } catch (e) {
        console.log("Error", e);
      }
    };

    // --------------------------------คำนวณ procutOwnID โดยการหา procutOwnID ที่มากที่สุด-------------------------------------------------------
    const checkAmountofProductOwnDoc = async () => {
      try {
        const productOwnDoc = await getDocs(collection(db, "productOwn")); //ดึงข้อมูล productOwn จาก Database 

        let maxProductOwnID = 0; // Initial ค่า max ให้เป็น 0
        productOwnDoc.forEach(doc => { // วนลูปเพื่อหาตัวที่มีค่ามากที่สุด
          console.log(doc.id);
          const currentProductOwnID = parseInt(doc.id.match(/\d+/)[0]);// ดึงส่วนของตัวเลขมาเก็บในcurrentProductOwnID เช่น pdv0009 -> 9
          if (currentProductOwnID  > maxProductOwnID) { //เปรียบเทียบค่าล่าสุด กับ ค่า max ถ้าค่าล่าสุดมากกว่าค่า max ก็จะให้ max = ค่าล่าสุด
            maxProductOwnID = currentProductOwnID;
          }
      });

      const newProductOwnID = `pdv${String(maxProductOwnID + 1).padStart(4,"0")}`; //คำนวณ ProductOwnID ตัวถัดไปโดยการนำค่า max มาบวก 1 

        setNewProductOwnID(newProductOwnID); // set newProductOwnID State 
        console.log("amount of productOwn", newProductOwnID);
      } catch (e) {
        console.log("Error", e);
      }
    };

    checkAmountofProductDoc();
    checkAmountofProductOwnDoc();
  }, []);

  // ------------------------------------action สำหรับตอนกดปุ่ม add Product-----------------------------------------------------------------
  const addProduct = async (e) => {
    e.preventDefault();

    try {
      // เช็คว่า ถ้ามีการใส่ saveDate กับ unitPrice มา โดยไม่มี vendorID จะทำให้ error
      if ((product.saveDate || product.unitPrice) && !product.vendorID) {
        throw new Error("Please fill in vendorID");
      }

      // เป็นการวนเช็คว่า state AddProductOwn แต่ละตัวที่ ไม่มี vendorID แต่ มี saveDate หรือ unitPrice ให้นำค่ามาเก็บไว้ที่ hasEmptyVendorID
      const hasEmptyVendorID = AddProductOwn.some(
        (productOwn) =>
          !productOwn.vendorID && (productOwn.saveDate || productOwn.unitPrice)
      );

      // เช็คว่าถ้า hasEmptyVendorID เป็น true จะโยน error
      if (hasEmptyVendorID) {
        throw new Error("Please fill in vendorID for each Product Own");
      }

      // เช็คว่า มี vendorID และ ใน AddProductOwn มีค่าอยู่ (หมายถึงมีการเพิ่ม ProductOwn)
      if (product.vendorID && AddProductOwn) {
        const productOwnCollectionRef = collection(db, "productOwn");

        // เพิ่มข้อมูลของ Product Own ที่ถูกเพิ่มเข้ามาผ่านอินพุตฟิลด์
        await Promise.all(
          //นำเอา AddProductOwn มา loop เพื่อเพิ่มข้อมูลลง Database
          AddProductOwn.map(async (productOwn, index) => {
            //เป็นการคำนวณ ProductOwnID โดยนำค่าจาก state ProductOwnID มาแล้วนำมาบวกด้วย ค่า index + 1
            const nextNewProductOwnID = `pdv${String(
              Number(newProductOwnID.slice(3)) + index + 1
            ).padStart(4, "0")}`;

            // สำหรับ Debugging
            console.log("addmore", nextNewProductOwnID);
            console.log(productOwn);
            console.log(productOwn.vendorID);
            console.log(productOwn.saveDate);
            console.log(productOwn.unitPrice);

            //เป็นการสร้าง Reference เพื่อเชื่อมกับ product และ vendor และนำไปเก็บใน productOwn collection
            const productDocRef = doc(db, "product", newProductID);
            const vendorDocRef = doc(db, "vendor", productOwn.vendorID);

            //เพิ่มค่า productOwn ลงใน Database (collection:productOwn)
            await setDoc(doc(productOwnCollectionRef, nextNewProductOwnID), {
              prodID: productDocRef,
              venID: vendorDocRef,
              savedDate: productOwn.saveDate || "",
              unitPrice: productOwn.unitPrice || "",
            });
          })
        );
      }

      // สร้าง Ref ไว้สำหรับ เพิ่มข้อมูลไปที่ product collection
      const productCollectionRef = collection(db, "product");

      //เพิ่มข้อมูลลง product collection
      await setDoc(doc(productCollectionRef, newProductID), {
        productName: product.productName,
        material: product.material,
        color: product.color,
        size: product.size,
        unit: product.unit,
      });

      //เช็คว่า มี vendorID ถึงจะเพิ่มข้อมูลได้
      if (product.vendorID) {
        //เป็นการสร้าง Ref อ้างอิง productOwn เพื่อจะนำไปใช้ตอน add ข้อมูลลง databases
        const productOwnCollectionRef = collection(db, "productOwn");

        //เป็นการสร้าง Reference เพื่อเชื่อมกับ product และ vendor และนำไปเก็บใน productOwn collection
        const productDocRef = doc(db, "product", newProductID);
        const vendorDocRef = doc(db, "vendor", product.vendorID);

        //เพิ่ม ProductOwn ลง Database (productOwn collection)
        await setDoc(doc(productOwnCollectionRef, newProductOwnID), {
          prodID: productDocRef,
          venID: vendorDocRef,
          savedDate: product.saveDate,
          unitPrice: product.unitPrice,
        });
      }

      // เป็นการคำนวณหา ProductID
      const checkAmountofProductDoc = async () => {
        try {
          const productDoc = await getDocs(collection(db, "product")); //ดึงข้อมูล product จาก Database 
  
          let maxProductID = 0; // Initial ค่า max ให้เป็น 0
          productDoc.forEach(doc => { // วนลูปเพื่อหาตัวที่มีค่ามากที่สุด
            console.log(doc.id);
            const currentProductID = parseInt(doc.id.match(/\d+/)[0]);// ดึงส่วนของตัวเลขมาเก็บในcurrentProductID เช่น pd0005 -> 5
            if (currentProductID  > maxProductID) {  //เปรียบเทียบค่าล่าสุด กับ ค่า max ถ้าค่าล่าสุดมากกว่าค่า max ก็จะให้ max = ค่าล่าสุด
              maxProductID = currentProductID;
            }
        });
        console.log("maxProductID",maxProductID);
  
        const newProductID = `pd${String(maxProductID + 1).padStart(4, "0")}`; //คำนวณ ProductID ตัวถัดไปโดยการนำค่า max มาบวก 1 
        console.log("newProductID",newProductID);
  
          setNewProductID(newProductID); // set newProductID State 
        } catch (e) {
          console.log("Error", e);
        }
      };

      checkAmountofProductDoc();

      // เป็นการคำนวณหา ProductOwnID
      const checkAmountofProductOwnDoc = async () => {
        try {
          const productOwnDoc = await getDocs(collection(db, "productOwn")); //ดึงข้อมูล productOwn จาก Database 
          
          let maxProductOwnID = 0; // Initial ค่า max ให้เป็น 0
          productOwnDoc.forEach(doc => { // วนลูปเพื่อหาตัวที่มีค่ามากที่สุด
            console.log(doc.id);
            const currentProductOwnID = parseInt(doc.id.match(/\d+/)[0]);// ดึงส่วนของตัวเลขมาเก็บในcurrentProductOwnID เช่น pdv0009 -> 9
            if (currentProductOwnID  > maxProductOwnID) {  //เปรียบเทียบค่าล่าสุด กับ ค่า max ถ้าค่าล่าสุดมากกว่าค่า max ก็จะให้ max = ค่าล่าสุด
              maxProductOwnID = currentProductOwnID;
            }
        });
  
        const newProductOwnID = `pdv${String(maxProductOwnID + 1).padStart(4,"0")}`; //คำนวณ ProductOwnID ตัวถัดไปโดยการนำค่า max มาบวก 1 
  
          setNewProductOwnID(newProductOwnID);  // set newProductOwnID State 
          console.log("amount of productOwn", newProductOwnID);
        } catch (e) {
          console.log("Error", e);
        }
      };

      checkAmountofProductOwnDoc();

      //หลังจากเพิ่มเสร็จก็ set State ให้เป็นค่าว่าง
      setProduct({
        productID: "",
        productName: "",
        material: "",
        color: "",
        size: "",
        unit: "",
        vendorID: "",
        saveDate: "",
        unitPrice: "",
      });

      //หลังจากเพิ่มเสร็จก็ set State ให้เป็นค่าว่าง
      setAddProductOwn([]);

      navigate("/AddProduct");

      // alert บอกว่า เพิ่มข้อมูลสำเร็จ
      alert("add successful");
    } catch (e) {
      // alert บอกว่า เพิ่มข้อมูล Fail
      alert("add fail");
      console.log("error", e);
    }
  };

  // ----------------------------------------- Action ของปุ่ม cancel -------------------------------------------------------------------

  //Set Product State ให้เป็นค่าว่างเปล่า
  const Cancel = () => {
    setProduct({
      productID: "",
      productName: "",
      material: "",
      color: "",
      size: "",
      unit: "",
      vendorID: "",
      saveDate: "",
      unitPrice: "",
    });

    //Set ProductOwn State ให้เป็นค่าว่างเปล่า
    setAddProductOwn([]);
  };

  // ---------------------------------------------- จัดการกับการเปลี่ยนข้อมูลใน input field ของ product --------------------------------------
  const handleChange = (e) => {
    const { id, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  // ------------------------------------------------- Action สำหรับปุ่มเพิ่ม ProductOwn -----------------------------------------------------
  const addProductOwn = () => {
    setAddProductOwn([...AddProductOwn, {}]);
  };

  // ------------------------------------------------- จัดการกับการเปลี่ยนข้อมูลใน input field ของ productOwn------------------------------------
  const handleAddProductOwnChange = (e, index) => {
    const { id, value } = e.target;
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns[index][id] = value;

    setAddProductOwn(updatedProductOwns);
  };

  // ----------------------------------------------- Action สำหรับปุ่มลบ ProductOwn -------------------------------------------------------
  const deleteProductOwn = (index) => {
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns.splice(index, 1);
    setAddProductOwn(updatedProductOwns);
  };

  return (
    //--------------------------------------------- H T M L ------------------------------------------------------------------------
    <div
      className={`container ${menuActive ? "menu-inactive" : "menu-active"}`}
    >
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />

      <div className="addProduct-form">
        <div className="addProduct-Head-manage">
          <IoChevronBack className="backButton" onClick={GoBack} />
          <h1 className="Head-Topic"> Add product</h1>
        </div>
        <form>
          <div className="Product">
            <div className="Product-info">
              Product
              <div className="Product-ID">
                <label htmlFor="productID">ProductID</label>
                <input
                  type="text"
                  id="productID"
                  onChange={handleChange}
                  value={newProductID}
                />
              </div>
              <div className="Product-Name">
                <label htmlFor="productName">Name</label>
                <input
                  type="text"
                  id="productName"
                  onChange={handleChange}
                  value={product.productName}
                />
              </div>
            </div>
            <div className="Description">
              Description
              <div className="Material">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  onChange={handleChange}
                  value={product.material}
                />
              </div>
              <div className="Color">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  onChange={handleChange}
                  value={product.color}
                />
              </div>
              <div className="Size">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  onChange={handleChange}
                  value={product.size}
                />
              </div>
              <div className="Unit">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  onChange={handleChange}
                  value={product.unit}
                />
              </div>
            </div>
          </div>
          <div className="Product-Own">
            <div className="Product-Own-Info">
              Product Own
              <div className="VendorID">
                <label htmlFor="vendorID">VendorID</label>
                <input
                  type="text"
                  id="vendorID"
                  onChange={handleChange}
                  value={product.vendorID}
                ></input>
              </div>
              <div className="SavedDate">
                <label htmlFor="saveDate">Saved Date</label>
                <input
                  type="date"
                  id="saveDate"
                  onChange={handleChange}
                  value={product.saveDate}
                ></input>
              </div>
              <div className="UnitPrice">
                <label htmlFor="unitPrice">Unit Price</label>
                <input
                  type="text"
                  id="unitPrice"
                  onChange={handleChange}
                  value={product.unitPrice}
                ></input>
              </div>
              <div className="AddmoreProductOwn">
                <IoIosAddCircle onClick={addProductOwn} className="AddmoreProductOwn-btn"/>
                <label className="add">Add more Product Own</label>

                <div className="more-vendor">
                  {AddProductOwn.map((productOwn, index) => (
                    <div key={index} className="addVendor">
                      <div className="addVendorID">
                        <label htmlFor="vendorID">VendorID</label>
                        <input
                          type="text"
                          id="vendorID"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.vendorID}
                        ></input>
                      </div>
                      <div className="AddSaveDate">
                        <label htmlFor="saveDate">Saved Date</label>
                        <input
                          type="date"
                          id="saveDate"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.saveDate}
                        ></input>
                      </div>
                      <div className="AddUnitPrice">
                        <label htmlFor="unitPrice">Unit Price</label>
                        <input
                          type="text"
                          id="unitPrice"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.unitPrice}
                        ></input>
                      </div>
                      <button
                        className="Delete-addvendor"
                        type="button"
                        onClick={() => deleteProductOwn(index)}
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

      <footer className="add-product-Footer">
        <div className="footer-manage">
          <div>
            <label>ProductID: {newProductID}</label>
          </div>

          <div className="Submit-Button">
            <div className="Cancle">
              <button className="Cancel-Button" onClick={Cancel}>
                Cancel
              </button>
            </div>
            <div className="Add-Product-Button">
              <button type="Submit-product" onClick={addProduct}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AddProduct;
