import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";

const routeTitleMap = {
  "/EnterInstallations": "Enter Installations",
  "/EnterMaintainance": "Enter Maintenance",
  "/ShowInstallations": "Show Installations",
  "/ShowMaintainance": "Show Maintenance",
  "/EnterUser": "Enter User",
  "/UsersTable": "Users Table",
  "/TableExamples": "Table Examples",
  "/dashboard": "Dashboard",
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const title = routeTitleMap[pathname] || "Elryan";
  return (
    <SidebarLayout title=''>
      <Outlet />
    </SidebarLayout>
  );
};

export default AppLayout;
