import React from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

function Layout({ children }) {
  return (
    <>
      <Sidebar />
      {children}
      <RightPanel />
    </>
  );
}

export default Layout;
