
import db from './db';


import installationsRaw from '../data/installations.json';
import maintenanceRaw from '../data/maintenance.json';
import brandsRaw from '../data/brands.json';
import governoratesRaw from '../data/governorates.json';
import usersRaw from '../data/users.json';


const asArray = (v) => {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
};


const normalizeInstallation = (item) => {
  return {
    date: item.date ?? new Date().toISOString(),
    orderNumber: item.orderNumber ?? null,
    governorate: item.governorate ?? null,
    customerName: item.customerName ?? '',
    address: item.address ?? '',
    phoneNumber: item.phoneNumber ?? '',
    productModel: item.productModel ?? '',
    brand: item.brand ?? '',
    quantity: item.quantity ?? 1,
    sup: item.sup ?? '',
    notes: item.notes ?? '',
    raisedBy: item.raisedBy ?? '',
    raisedAt: item.raisedAt ?? new Date().toISOString()
  };
};


const normalizeMaintenance = (item) => {
  const dateIso = item.date ?? new Date().toISOString();
  let time = '';
  try {
    const d = new Date(dateIso);

    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    time = `${hh}:${mm}`;
  } catch (e) {
    time = '';
  }

  return {
    date: dateIso,
    time, 
    orderNumber: item.orderNumber ?? null,
    governorate: item.governorate ?? null,
    customerName: item.customerName ?? '',
    address: item.address ?? '',
    phoneNumber: item.phoneNumber ?? '',
    additionalPhoneNumber: item.additionalPhoneNumber ?? '',
    deviceType: item.device ?? item.deviceType ?? '',
    deviceTypeCode: item.deviceCode ?? item.deviceTypeCode ?? '',
    brand: item.brand ?? '',
    sup: item.sup ?? '',
    defectDescription: item.defectDescription ?? '',
    isRelatedToProject: !!item.isRelatedToProject,
    projectName: item.projectName ?? '',
    notes: item.notes ?? '',
    raisedBy: item.raisedBy ?? '',
    raisedAt: item.raisedAt ?? new Date().toISOString()
  };
};


const normalizeBrandsArray = (arr) => {
  const names = asArray(arr).map((s) => String(s).trim()).filter(Boolean);
  
  const unique = Array.from(new Map(names.map((n) => [n.toLowerCase(), n])).values());
  return unique.map((name, idx) => ({
    id: undefined, 
    name,
    status: 'active'
  }));
};


const normalizeGovernorates = (arr) => {
  return asArray(arr).map((name) => ({ name }));
};


const generateDeviceTypesFromMaintenance = (maintenanceArray) => {
  const list = asArray(maintenanceArray).map((m) => ({
    name: (m.device ?? m.deviceType ?? '').toString().trim(),
    code: (m.deviceCode ?? m.deviceTypeCode ?? '').toString().trim()
  })).filter((x) => x.name || x.code);

  
  const map = new Map();
  for (const it of list) {
    const key = `${(it.name||'').toLowerCase()}||${(it.code||'').toLowerCase()}`;
    if (!map.has(key)) map.set(key, it);
  }

  return Array.from(map.values()).map((d) => ({ name: d.name, code: d.code, status: 'active' }));
};


export const initializeDB = async () => {

  const counts = await Promise.all([
    db.installationCases.count(),
    db.maintenanceCases.count(),
    db.brands.count(),
    db.deviceTypes.count(),
    db.governorates.count(),
    db.users.count()
  ]);

  const [instCount, maintCount, brandsCount, deviceCount, govCount, usersCount] = counts;


  if (instCount === 0) {
    const instArr = asArray(installationsRaw).map(normalizeInstallation);
    if (instArr.length) {
      await db.installationCases.bulkAdd(instArr);
      console.log(`Seeded ${instArr.length} installationCases`);
    }
  } else {
    console.log('installationCases already seeded');
  }


  if (maintCount === 0) {
    const maintArr = asArray(maintenanceRaw).map(normalizeMaintenance);
    if (maintArr.length) {
      await db.maintenanceCases.bulkAdd(maintArr);
      console.log(`Seeded ${maintArr.length} maintenanceCases`);
    }

  } else {
    console.log('maintenanceCases already seeded');
  }

  if (brandsCount === 0) {
    const brandsArr = normalizeBrandsArray(brandsRaw);
    if (brandsArr.length) {
      await db.brands.bulkAdd(brandsArr);
      console.log(`Seeded ${brandsArr.length} brands`);
    }
  } else {
    console.log('brands already seeded');
  }


  if (govCount === 0) {
    const govArr = normalizeGovernorates(governoratesRaw);
    if (govArr.length) {
      await db.governorates.bulkAdd(govArr);
      console.log(`Seeded ${govArr.length} governorates`);
    }
  } else {
    console.log('governorates already seeded');
  }


  if (deviceCount === 0) {
    const generated = generateDeviceTypesFromMaintenance(maintenanceRaw);
    if (generated.length) {
      await db.deviceTypes.bulkAdd(generated);
      console.log(`Seeded ${generated.length} deviceTypes (from maintenance.json)`);
    } else {
      console.log('No deviceTypes generated from maintenance.json');
    }
  } else {
    console.log('deviceTypes already seeded');
  }


  if (usersCount === 0) {
    const usersArr = asArray(usersRaw);
    if (usersArr.length) {
    
      await db.users.bulkAdd(usersArr);
      console.log(`Seeded ${usersArr.length} users`);
    }
  } else {
    console.log('users already seeded');
  }

  console.log('DB initialize complete');
};
