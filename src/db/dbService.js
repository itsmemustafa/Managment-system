// src/dbService.js
import db from "./db";


export const getAllInstallations = async () => {
  return await db.installationCases.toArray();
};
export const getInstallationById = async (id) => {
  return await db.installationCases.get(id);
};
export const addInstallation = async (payload) => {

  const item = {
    ...payload,
    date: payload.date ?? new Date().toISOString(),
    raisedAt: payload.raisedAt ?? new Date().toISOString(),
  };
  return db.installationCases.add(item);
};
export const updateInstallation = async (id, changes) => {
  return db.installationCases.update(id, changes);
};
export const deleteInstallation = async (id) => {
  return db.installationCases.delete(id);
};

export const getAllMaintenance = async () => {
  return await db.maintenanceCases.toArray();
};
export const getMaintenanceById = async (id) => {
  return await db.maintenanceCases.get(id);
};
export const addMaintenance = async (payload) => {
  const dateIso = payload.date ?? new Date().toISOString();
  let time = "";
  try {
    const d = new Date(dateIso);
    time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  } catch (e) {
    time = "";
  }
  const item = {
    ...payload,
    date: dateIso,
    time,
    raisedAt: payload.raisedAt ?? new Date().toISOString(),
  };
  return db.maintenanceCases.add(item);
};
export const updateMaintenance = async (id, changes) => {
  
  if (changes.date) {
    const d = new Date(changes.date);
    changes.time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }
  return db.maintenanceCases.update(id, changes);
};
export const deleteMaintenance = async (id) => {
  return db.maintenanceCases.delete(id);
};


export const getAllBrands = async () => {
  return await db.brands.toArray();
};
export const addBrand = async (payload) => {

  const name = (payload.name || "").trim();
  if (!name) throw new Error("Brand name required");
  const exists = await db.brands.where("name").equalsIgnoreCase(name).first();
  if (exists) throw new Error("Brand already exists");
  return db.brands.add({ name, status: payload.status ?? "active" });
};
export const updateBrand = async (id, changes) => {

  if (changes.name) {
    const name = changes.name.trim();
    const existing = await db.brands
      .where("name")
      .equalsIgnoreCase(name)
      .first();
    if (existing && existing.id !== id)
      throw new Error("Brand name already taken");
  }
  return db.brands.update(id, changes);
};
export const deleteBrand = async (id) => {
  return db.brands.delete(id);
};


export const getAllDeviceTypes = async () => {
  return await db.deviceTypes.toArray();
};
export const addDeviceType = async (payload) => {
  const name = (payload.name || "").trim();
  const code = (payload.code || "").trim();
  if (!name) throw new Error("Device type name required");
  
  const byName = await db.deviceTypes
    .where("name")
    .equalsIgnoreCase(name)
    .first();
  const byCode = code
    ? await db.deviceTypes.where("code").equalsIgnoreCase(code).first()
    : null;
  if (byName || byCode) throw new Error("Device type name/code already exists");
  return db.deviceTypes.add({ name, code, status: payload.status ?? "active" });
};
export const updateDeviceType = async (id, changes) => {
  if (changes.name) {
    const name = changes.name.trim();
    const byName = await db.deviceTypes
      .where("name")
      .equalsIgnoreCase(name)
      .first();
    if (byName && byName.id !== id)
      throw new Error("Device type name already exists");
  }
  if (changes.code) {
    const code = changes.code.trim();
    const byCode = await db.deviceTypes
      .where("code")
      .equalsIgnoreCase(code)
      .first();
    if (byCode && byCode.id !== id)
      throw new Error("Device type code already exists");
  }
  return db.deviceTypes.update(id, changes);
};
export const deleteDeviceType = async (id) => {
  return db.deviceTypes.delete(id);
};

// GOVERNORATES
export const getAllGovernorates = async () => {
  return await db.governorates.toArray();
};

// USERS
export const getAllUsers = async () => {
  return await db.users.toArray();
};
export const getUserByEmail = async (email) => {
  return await db.users.where("email").equalsIgnoreCase(email).first();
};
export const addUser = async (payload) => {
  if (!payload.email) throw new Error("Email required");
  const existing = await db.users
    .where("email")
    .equalsIgnoreCase(payload.email)
    .first();
  if (existing) throw new Error("User already exists");

 
  const allUsers = await db.users.toArray();
  const maxId =
    allUsers.length > 0 ? Math.max(...allUsers.map((user) => user.id)) : 0;
  const nextId = maxId + 1;

  return db.users.add({
    email: payload.email,
    password: payload.password ?? "",
    role: payload.role ?? "USER",
    isActive: payload.isActive ?? true,
  });
};
export const updateUser = async (id, changes) => {
  if (changes.email) {
    const existing = await db.users
      .where("email")
      .equalsIgnoreCase(changes.email)
      .first();
    if (existing && existing.id !== id) throw new Error("Email already used");
  }
  return db.users.update(id, changes);
};
export const deleteUser = async (id) => {
  return db.users.delete(id);
};
