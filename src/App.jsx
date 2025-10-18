// src/App.jsx
import React, { useEffect, useState } from "react";
import { initializeDB } from "./db/initDB";
import {
  getAllInstallations,
  getAllMaintenance,
  getAllBrands,
  getAllDeviceTypes,
  getAllGovernorates,
  getAllUsers,
} from "./db/dbService";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BubbleBackground } from "./components/animate-ui/components/backgrounds/bubble";

import loader from "@/assets/elryanLogo.png";

import EnterInstallations from "./pages/EnterInstallations";
import EnterMaintainance from "./pages/EnterMaintainance";
import ShowINstallations from "./pages/ShowINstallations";
import ShowMaintainance from "./pages/ShowMaintainance";
import Login from "./pages/login";
import EnterUser from "./pages/EnterUser";
import UsersTablePage from "./pages/UsersTablePage";
import Chart1 from "./pages/Charts/chart1";
import Chart2 from "./pages/Charts/chart2";
import Chart3 from "./pages/Charts/chart3";
import Chart4 from "./pages/Charts/chart4";
import Chart5 from "./pages/Charts/chart5";
import Chart6 from "./pages/Charts/chart6";
import Chart7 from "./pages/Charts/chart7";
import Chart8 from "./pages/Charts/chart8";

import AppLayout from "./components/AppLayout";
import RoleGuard from "./components/RoleGuard";
import Home from "./pages/Home";
import './App.css'
export default function App() {
  const [ready, setReady] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      try {
        await initializeDB();

        const [insts, mains, brands, devices, govs, users] = await Promise.all([
          getAllInstallations(),
          getAllMaintenance(),
          getAllBrands(),
          getAllDeviceTypes(),
          getAllGovernorates(),
          getAllUsers(),
        ]);

        setCounts({
          installations: insts.length,
          maintenance: mains.length,
          brands: brands.length,
          deviceTypes: devices.length,
          governorates: govs.length,
          users: users.length,
        });

        setReady(true);
      } catch (err) {
        console.error("DB init error", err);
      }
    })();
  }, []);

  const LoadingScreen = () => {
    const styles = {
      container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9fafb",
      },
      image: {
        width: "100px",
        height: "100px",
        animation: "spinPulse 2s infinite ease-in-out",
      },
    };

    return (
      <div style={styles.container}>
        <img src={loader} alt="Loading..." style={styles.image} />
        <style>
          {`
            @keyframes spinPulse {
              0% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.15); }
              100% { transform: rotate(360deg) scale(1); }
            }
          `}
        </style>
      </div>
    );
  };

  if (!ready) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <BubbleBackground interactive={false} className="absolute inset-0 z-0 pointer-events-none" />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AppLayout />}>
     
          <Route element={<RoleGuard allowed={["ADMIN", "SUPERVISOR"]} />}>
            <Route path="/home" element={<Home />} />
          </Route>

        
          <Route element={<RoleGuard allowed={["ADMIN", "SUPERVISOR", "USER"]} />}>
            <Route path="/ShowMaintainance" element={<ShowMaintainance />} />
            <Route path="/ShowInstallations" element={<ShowINstallations />} />
          </Route>

    
          <Route element={<RoleGuard allowed={["ADMIN", "USER"]} />}>
            <Route path="/EnterInstallations" element={<EnterInstallations />} />
            <Route path="/EnterMaintainance" element={<EnterMaintainance />} />
          </Route>

        
          <Route element={<RoleGuard allowed={["ADMIN"]} />}>
            <Route path="/EnterUser" element={<EnterUser />} />
            <Route path="/UsersTable" element={<UsersTablePage />} />
          </Route>

        
          <Route element={<RoleGuard allowed={["ADMIN", "SUPERVISOR"]} />}>
            <Route path="/chart1" element={<Chart1 />} />
            <Route path="/chart2" element={<Chart2 />} />
            <Route path="/chart3" element={<Chart3 />} />
            <Route path="/chart4" element={<Chart4 />} />
            <Route path="/chart5" element={<Chart5 />} />
            <Route path="/chart6" element={<Chart6 />} />
            <Route path="/chart7" element={<Chart7 />} />
            <Route path="/chart8" element={<Chart8 />
          } />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
