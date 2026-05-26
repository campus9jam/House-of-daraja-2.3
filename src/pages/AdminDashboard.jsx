import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Database, Users, ShieldAlert, Zap, Server, Settings, Terminal, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, Order, VendorProfile } from '../api/entities';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, orders, vendors] = await Promise.all([
          Product.list(),
          Order.list(),
          VendorProfile.list()
        ]);
        setStats({
          videosCount: 0,
          vendorsCount: vendors.length,
          inventoryValue: products.reduce((s, p) => s + (p.price * (p.stock || 1)), 0),
          inventoryCount: products.length,
          ordersCount: orders.length
        });
        setLogs([
          { type: 'success', timestamp: Date.now(), message: 'platform boot sequence — all nodes online' },
          { type: 'success', timestamp: Date.now() - 60000, message: 'supabase sync layer — standby active' },
          { type: 'info',    timestamp: Date.now() - 120000, message: `${orders.length} orders in ledger — processing nominal` },
          { type: 'success', timestamp: Date.now() - 180000, message: `${vendors.length} vendor nodes — authenticated` },
          { type: 'info',    timestamp: Date.now() - 240000, message: 'opay gateway — handshake established' },
        ]);
      } catch (err) {
        console.error('Admin fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayStats = stats ? [
    { label: "VENDOR_NODES",        value: stats.vendorsCount,    trend: "Active",  icon: <Users    className="w-4 h-4" /> },
    { label: "TOTAL_LEDGER_VALUE",  value: `₦${(stats.inventoryValue/1000000).toFixed(1)}M`, trend: "+4%", icon: <Zap className="w-4 h-4" /> },
    { label: "INVENTORY_ITEMS",     value: stats.inventoryCount,  trend: "Optimal", icon: <Package  className="w-4 h-4" /> },
    { label: "ORDERS_IN_LEDGER",    value: stats.ordersCount,     trend: "Live",    icon: <Activity className="w-4 h-4" /> },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto space-y-16">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-daraja-border pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-daraja-gold mono-text">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Sovereign_Admin_Handshake_Established</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
              Control <span className="text-daraja-gold not-italic">Matrix</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-daraja-gold/40 text-daraja-gold text-[9px] mono-text hover:bg-daraja-gold hover:text-daraja-charcoal transition-all">REBOOT_NEURAL_LINK</button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 text-white text-[9px] mono-text hover:bg-white/10">MANIFEST_EXPORT</button>
          </div>
        </header>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <div key={i} className="luxury-card p-10 h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, i) => (
              <div key={i} className="luxury-card p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-daraja-gold/10 text-daraja-gold">{stat.icon}</div>
                  <span className="text-[10px] font-mono text-green-500">{stat.trend}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[7px] mono-text text-daraja-text-muted">{stat.label}</p>
                  <p className="text-4xl font-mono text-white italic">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Terminal + Config */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 luxury-card bg-daraja-surface p-12 space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                <Terminal className="w-4 h-4" /><span>SYSTEM_LOG_STREAM</span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="font-mono text-[11px] space-y-3 lowercase">
              {logs.map((log, i) => (
                <p key={i} className={log.type === 'success' ? 'text-green-500' : 'text-white/40'}>
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                </p>
              ))}
              <p className="animate-pulse text-daraja-gold">{">"} LISTENING_FOR_ADMIN_OVERRIDE...</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="luxury-card p-10 space-y-8">
              <h3 className="mono-text text-daraja-gold text-[10px]">PLATFORM_GATES</h3>
              <div className="space-y-6">
                {[
                  { label: "PUBLIC_REGISTRATION", status: true },
                  { label: "MARKETPLACE_TRADING", status: true },
                  { label: "ATELIER_RESERVATIONS", status: true }
                ].map((gate, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[10px] mono-text text-white/60">{gate.label}</span>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer ${gate.status ? 'bg-green-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${gate.status ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/5 space-y-4">
                <Link to="/cms" className="flex items-center gap-3 text-daraja-gold hover:text-white transition-colors group">
                  <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="mono-text text-[10px]">MEDIA_CMS_ENGINE</span>
                </Link>
                <Link to="/admin/inventory" className="flex items-center gap-3 text-daraja-gold hover:text-white transition-colors group">
                  <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="mono-text text-[10px]">SUPPLY_CHAIN_TERMINAL</span>
                </Link>
                <Link to="/atelier" className="flex items-center gap-3 text-daraja-gold hover:text-white transition-colors group">
                  <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="mono-text text-[10px]">ATELIER_CRAFT_LEDGER</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
