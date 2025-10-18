import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import getUser from '../Utils/getUser';

export default function RoleGuard({ allowed }) {
  const user = getUser('currentUser');
  if (!user) return <Navigate to="/" replace />;
  const role = String(user?.role || '').toUpperCase();
  if (!allowed || allowed.includes(role)) return <Outlet />;
  return <Navigate to="/" replace />;
}
