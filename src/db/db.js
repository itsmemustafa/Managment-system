// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('CasesAppDB');

db.version(1).stores({
  installationCases: '++id, date, orderNumber, governorate, customerName',
  maintenanceCases: '++id, date, orderNumber, governorate, customerName, deviceTypeCode',
  brands: '++id, name',          
  deviceTypes: '++id, name, code',
  governorates: '++id, name',
  users: '++id, email, role, isActive'
});

export const tables = {
  installations: db.installationCases,
  maintenance: db.maintenanceCases,
  brands: db.brands,
  deviceTypes: db.deviceTypes,
  governorates: db.governorates,
  users: db.users
};

export default db;
