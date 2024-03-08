import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import  * as Mdicons from "react-icons/md";

export const SidebarData = [
  {
    title: "Home",
    path: "/home",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "My Work",
    path: "",
    icon: < Mdicons.MdWork/>,
    cName: "nav-text",
  },
  {
    title: "Quotations",
    path: "/Createquotation",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
  {
    title: "Purchase Orders",
    path: "",
    icon: <IoIcons.IoMdPaper  />,
    cName: "nav-text",
  },
  {
    title: "Receipts",
    path: "",
    icon: <FaIcons.FaEnvelopeOpenText />,
    cName: "nav-text",
  },
  {
    title: "Vendor List",
    path: "/Addvendor",
    icon: <IoIcons.IoMdPeople  />,
    cName: "nav-text",
  },
];