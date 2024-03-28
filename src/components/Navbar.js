import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as Mdicons from "react-icons/md";
import { Link } from "react-router-dom";
import { SidebarData } from "./SideBarData";
import "../App.css";
// import "./css/Navbar.css";
import { IconContext } from "react-icons";

function Navbar({ setMenuActive }) {
   const [sidebar, setSidebar] = useState(true);
   const [activeLink, setActiveLink] = useState("");

   const toggleSidebar = () => {
      setSidebar(!sidebar);
      setMenuActive(!sidebar);
   };
   const handleItemClick = (title) => {
      setActiveLink(title);
      toggleSidebar();
      setMenuActive(!sidebar);
   };


   return (
      <>
         <IconContext.Provider value={{ color: "undefined" }}>
            <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
               <ul className="nav-menu-items">
                  <li className="navbar-toggle">
                     <div className="supply-pro-container">
                        <div className="supply-pro">
                           <span className="supply">Supply</span>
                           <span className="pro">Pro</span>
                           <Link to="#" className="menu-bars" onClick={toggleSidebar}>
                              {sidebar ? (
                                 <Mdicons.MdOutlineArrowBackIos />
                              ) : (
                                 <Mdicons.MdOutlineArrowForwardIos />
                              )}
                           </Link>
                        </div>
                     </div>
                     <div className="other-container">
                        {/* Content for the other container */}
                     </div>
                  </li>
                  {SidebarData.map((item, index) => (
                     <li key={index} className={item.cName}>
                        <Link
                           to={item.path}
                           className={item.title === activeLink ? "active" : ""}
                           onClick={() => handleItemClick(item.title)}
                        >
                           {item.icon}
                           <span>{item.title}</span>
                        </Link>
                     </li>
                  ))}
               </ul>
            </nav>
         </IconContext.Provider>
      </>
   );
}

export default Navbar;
