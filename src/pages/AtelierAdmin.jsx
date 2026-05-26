import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Ruler, Hammer, CheckCircle2, ChevronRight, Clock, User, ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtelierOrder } from '../api/entities';

export default function AtelierAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AtelierOrder.list('-created_date', 20)
      .then(data => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (status) => {
    const map = { Submitted: 5, Cutting: 25, Sewing: 60, Finishing: 85, Ready: 100, Delivered: 100 };
    return map[status] || 5;
  };

  const getIcon = (node) => {
    if (node.includes('Measure')) return <Ruler className="w-5 h-5" />;
    if (node.includes('Cutting')) return <Scissors className="w-5 h-5" />;
    if (node.includes('Assembly')) return <Hammer className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-16">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-daraja-border pb-12">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="p-4 glass border border-white/10 text-white hover:text-daraja-gold transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-daraja-gold mono-text">
                <Scissors className="w-4 h-4" /> <span>Atelier_Command_Link_Pulse</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
                Craft <span className="text-daraja-gold not-italic">Ledger</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-8 text-[10px] mono-text text-white/40">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-daraja-gold" /> AVG_TURNAROUND: 14D
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-4 h-4" /> QC_PASS: 99.8%
            </div>
          </div>
        </header>

        {/* Production Nodes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {['Archived_Measures', 'Cutting_Floor', 'Assembly_Line', 'Final_Vetting'].map((node, i) => (
            <div key={i} className="luxury-card p-10 space-y-6 hover:bg-daraja-gold/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-daraja-charcoal border border-daraja-border flex items-center justify-center text-daraja-gold">
                {getIcon(node)}
              </div>
              <div className="space-y-1">
                <p className="text-[7px] mono-text text-daraja-text-muted">NODE_STATUS</p>
                <h3 className="mono-text text-white text-[10px]">{node}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
            <div className="w-3 h-3 rounded-full bg-daraja-gold animate-pulse" />
            ACTIVE_REQUISITIONS_IN_PRODUCTION
          </div>

          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="luxury-card h-24 animate-pulse" />)
          ) : orders.length === 0 ? (
            <div className="text-center py-24 text-daraja-text-muted mono-text text-[10px]">NO_ACTIVE_ORDERS</div>
          ) : orders.map(order => (
            <div key={order.id} className="luxury-card p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-8 flex-[2]">
                <div className="w-4 h-[1px] bg-daraja-gold/40" />
                <div className="space-y-1">
                  <p className="text-[8px] mono-text text-daraja-gold">{order.serial_number || `HD_ATEL_${order.id?.slice(-6)}`}</p>
                  <h4 className="text-2xl font-serif italic text-white">{order.fabric} Commission</h4>
                  <p className="text-[7px] mono-text text-daraja-text-muted flex items-center gap-2">
                    <User className="w-3 h-3" /> {order.user_id || 'CLIENT_NODE'}
                  </p>
                </div>
              </div>

              <div className="flex-[2] w-full space-y-3 px-8">
                <div className="flex justify-between mb-1">
                  <span className="text-[7px] mono-text text-white/40">CRAFT_PROGRESS</span>
                  <span className="text-[7px] mono-text text-daraja-gold">{getProgress(order.status)}%</span>
                </div>
                <div className="w-full h-[1px] bg-white/5 relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-daraja-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress(order.status)}%` }}
                  />
                </div>
                <p className="text-[7px] mono-text text-daraja-text-muted uppercase tracking-[0.4em]">
                  Current_Phase: <span className="text-white italic">{order.status}</span>
                </p>
              </div>

              <div className="flex-1 flex justify-end">
                <button className="flex items-center gap-3 px-8 py-4 border border-white/10 text-white mono-text text-[9px] hover:border-daraja-gold hover:text-daraja-gold transition-all group">
                  UPDATE_STATUS <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
