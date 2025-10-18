import React, { useEffect, useMemo, useState } from 'react';
import getUser from '../Utils/getUser';
import { TextAnimate } from '@/components/ui/text-animate';
import NumberTicker from '@/components/NumberTicker';
import {
  getAllInstallations,
  getAllMaintenance,
  getAllBrands,
  getAllDeviceTypes,
  getAllGovernorates,
  getAllUsers,
} from '../db/dbService';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Home() {
  const currentUser = getUser('currentUser');
  const role = String(currentUser?.role || '').toUpperCase();

  const [stats, setStats] = useState({
    installations: 0,
    maintenance: 0,
    brands: 0,
    deviceTypes: 0,
    governorates: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState({ insts: [], mains: [], users: [], govs: [], devices: [] });
 const username = currentUser.email.split("@")[0];
const text = `Welcome ${username} to Elryan management system`;
  useEffect(() => {
    (async () => {
      try {
        const [insts, mains, brands, devices, govs, users] = await Promise.all([
          getAllInstallations(),
          getAllMaintenance(),
          getAllBrands(),
          getAllDeviceTypes(),
          getAllGovernorates(),
          getAllUsers(),
        ]);

        setStats({
          installations: insts.length,
          maintenance: mains.length,
          brands: brands.length,
          deviceTypes: devices.length,
          governorates: govs.length,
          users: users.length,
        });
        setRaw({ insts, mains, users, govs, devices });
      } catch (e) {
        console.error('Home stats load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build small chart datasets (non-date based)
  const instByGov = useMemo(() => {
    const tally = {};
    raw.insts.forEach((it) => {
      const g = String(it.governorate || 'Unknown');
      tally[g] = (tally[g] || 0) + 1;
    });
    const arr = Object.entries(tally).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 8); // top 8
  }, [raw.insts]);

  const mainByDeviceType = useMemo(() => {
    // map deviceTypes by code to name
    const nameByCode = new Map();
    raw.devices.forEach((d) => nameByCode.set(String(d.code || '').toUpperCase(), d.name || d.code));
    const tally = {};
    raw.mains.forEach((m) => {
      const code = String(m.deviceTypeCode || '').toUpperCase();
      const name = nameByCode.get(code) || code || 'Unknown';
      tally[name] = (tally[name] || 0) + 1;
    });
    const arr = Object.entries(tally).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 8);
  }, [raw.mains, raw.devices]);

  const mainByGovernorate = useMemo(() => {
    const tally = {};
    raw.mains.forEach((m) => {
      const g = String(m.governorate || 'Unknown');
      tally[g] = (tally[g] || 0) + 1;
    });
    const arr = Object.entries(tally).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 8);
  }, [raw.mains]);

  const mainByBrand = useMemo(() => {
    const tally = {};
    raw.mains.forEach((m) => {
      const b = String(m.brand || 'Unknown');
      tally[b] = (tally[b] || 0) + 1;
    });
    const arr = Object.entries(tally).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 8);
  }, [raw.mains]);

  const rolePie = useMemo(() => {
    const tally = { ADMIN: 0, SUPERVISOR: 0, USER: 0 };
    raw.users.forEach((u) => {
      const r = String(u.role || '').toUpperCase();
      if (tally[r] != null) tally[r]++;
    });
    return [
      { name: 'ADMIN', value: tally.ADMIN },
      { name: 'SUPERVISOR', value: tally.SUPERVISOR },
      { name: 'USER', value: tally.USER },
    ];
  }, [raw.users]);

  return (
    <div >
      
<div className="rounded-xl bg-gradient-to-r text-black flex flex-col items-center justify-center text-center p-4">
  <TextAnimate
  className="text-2xl font-semibold"
  animation="blurInUp"
  by="character"
  duration={3}
>
  {text}
</TextAnimate>

  <p className="text-sm opacity-70 font-semibold text-gray-600 mt-2">
    Role: {role}
  </p>
</div>


      <div className="rounded-lg   ">

        <CarouselThree autoPlay interval={2500}>
          <Card title="Installations by Governorate">
            <MiniBar data={instByGov} barColor="#2563eb" />
          </Card>
          <Card title="Maintenance by Device Type">
            <MiniBar data={mainByDeviceType} barColor="#f59e0b" />
          </Card>
          <Card title="Users by Role">
            <MiniPie data={rolePie} colors={["#ef4444", "#3b82f6", "#10b981"]} />
          </Card>
          <Card title="Maintenance by Governorate">
            <MiniBar data={mainByGovernorate} barColor="#0ea5e9" />
          </Card>
          <Card title="Maintenance by Brand">
            <MiniBar data={mainByBrand} barColor="#8b5cf6" />
          </Card>
        </CarouselThree>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard variant="installations" label="Installations" value={stats.installations} loading={loading} />
        <StatCard variant="maintenance" label="Maintenance" value={stats.maintenance} loading={loading} />
        <StatCard variant="brands" label="Brands" value={stats.brands} loading={loading} />
        <StatCard variant="deviceTypes" label="Device Types" value={stats.deviceTypes} loading={loading} />
        <StatCard variant="governorates" label="Governorates" value={stats.governorates} loading={loading} />
        <StatCard variant="users" label="Users" value={stats.users} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <Card title="Quick Actions">
          <div className="flex flex-wrap gap-2">
            {(role === 'ADMIN' || role === 'SUPERVISOR') && (
              <>
                <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/chart1">Analytics</Link>
                <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/UsersTable">Users</Link>
              </>
            )}
            <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/ShowInstallations">View Installations</Link>
            <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/ShowMaintainance">View Maintenance</Link>
          </div>
        </Card>
        <Card title="Shortcuts">
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/EnterInstallations">Add Installation</Link>
            <Link className="inline-flex items-center px-3 py-2 rounded-md border hover:bg-muted" to="/EnterMaintainance">Add Maintenance</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading, variant = 'neutral' }) {
  const variants = {
    neutral: {
      bg: 'bg-card',
      border: 'border',
      text: 'text-foreground',
      muted: 'text-muted-foreground',
    },
    installations: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      muted: 'text-blue-600',
    },
    maintenance: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      muted: 'text-amber-600',
    },
    brands: {
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200',
      text: 'text-fuchsia-800',
      muted: 'text-fuchsia-600',
    },
    deviceTypes: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-800',
      muted: 'text-teal-600',
    },
    governorates: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      muted: 'text-emerald-600',
    },
    users: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      muted: 'text-indigo-600',
    },
  };
  const v = variants[variant] || variants.neutral;
  return (
    <div className={`rounded-lg border ${v.border} ${v.bg} p-4`}>
      <div className={`text-sm ${v.muted}`}>{label}</div>
      <div className={`text-2xl font-semibold ${v.text}`} aria-live="polite" aria-atomic="true">
        {loading ? '—' : <NumberTicker value={value} />}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function MiniArea({ data, stroke = '#3b82f6', fill = '#bfdbfe' }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis hide />
          <RTooltip formatter={(v) => [v, 'Count']} />
          <Area type="monotone" dataKey="value" stroke={stroke} fill={fill} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ data, barColor = '#f59e0b' }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis hide />
          <RTooltip formatter={(v) => [v, 'Count']} />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniPie({ data, colors }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <RTooltip formatter={(v, n) => [v, n]} />
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={60} innerRadius={30} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CarouselThree({ children, autoPlay = true, interval = 5000 }) {
  const items = React.Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, items.length]);

  const goTo = (i) => setIndex(i);
  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  const getPosition = (offset) => {
    const positions = [
      { x: '-85%', z: -300, scale: 0.7, opacity: 0.3, rotate: 25, blur: 4 },
      { x: '-45%', z: -150, scale: 0.85, opacity: 0.6, rotate: 12, blur: 2 },
      { x: '0%', z: 0, scale: 1, opacity: 1, rotate: 0, blur: 0 },
      { x: '45%', z: -150, scale: 0.85, opacity: 0.6, rotate: -12, blur: 2 },
      { x: '85%', z: -300, scale: 0.7, opacity: 0.3, rotate: -25, blur: 4 },
    ];
    const idx = offset + 2;
    return positions[idx] || { x: '0%', z: -400, scale: 0.5, opacity: 0, rotate: 0, blur: 6 };
  };

  return (
    <div className="w-full py-8">
      <div
        className="relative h-64 md:h-80"
        style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}
        role="region"
        aria-label="Chart carousel"
      >
        {items.map((item, i) => {
          const offset = ((i - index + items.length) % items.length);
          const adjustedOffset = offset > items.length / 2 ? offset - items.length : offset;
          const pos = getPosition(adjustedOffset);
          const isVisible = Math.abs(adjustedOffset) <= 2;

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-full md:w-80 transition-all duration-700 ease-out cursor-pointer"
              style={{
                transform: `
                  translate(-50%, -50%)
                  translateX(${pos.x})
                  translateZ(${pos.z}px)
                  scale(${pos.scale})
                  rotateY(${pos.rotate}deg)
                `,
                opacity: pos.opacity,
                filter: `blur(${pos.blur}px)`,
                zIndex: 100 - Math.abs(adjustedOffset),
                pointerEvents: adjustedOffset === 0 ? 'auto' : 'none',
                display: isVisible ? 'block' : 'none',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => adjustedOffset !== 0 && goTo(i)}
              role="group"
              aria-hidden={adjustedOffset !== 0}
            >
              <div className="shadow-2xl rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Carousel navigation">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 transition-all duration-300 rounded-full ${
                i === index ? 'w-8 bg-blue-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}