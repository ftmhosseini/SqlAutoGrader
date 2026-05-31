import { NavLink } from 'react-router-dom';
import React, { useState } from "react";

const LeftMenu = ({ name, navItems }) => {
    const [isOpen] = useState(true);
  return (
    <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${
        isOpen ? "" : "collapsed toggled"}`} id="accordionSidebar">
      <span className="sidebar-brand d-flex align-items-center justify-content-center" role="banner">
        <div className="sidebar-brand-text mx-3"> {isOpen ? name : name.charAt(0)}</div>
        <span className="d-md-none">{name.charAt(0)}</span>
      </span>

      <hr className="sidebar-divider my-0"/>

      {navItems.map((item) => (
        <li className="nav-item" key={item.address}>
          <NavLink className="nav-link" to={item.address}>
            <i className={`fas fa-fw ${item.icon}`}></i>
             {/* Hide text when collapsed */}
            <span>{item.name}</span>
          </NavLink>
        </li>
      ))}

      <hr className="sidebar-divider  d-none d-md-block"/>
   
    {/* Toggle Button */}
      {/* <div className="text-center d-none d-md-inline">
        <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleSidebar}></button>
       </div> */}


    </ul>
  );
};

export default LeftMenu;
