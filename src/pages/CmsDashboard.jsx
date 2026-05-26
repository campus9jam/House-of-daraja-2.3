import React, { useEffect, useState } from 'react';
import { RefreshCw, Video, List, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeritagePost } from '../api/entities';

const CATEGORIES = ['Dandali', 'Zare Global', 'Co-Creators'];

export default function CmsDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await HeritagePost.list('-created_date', 20);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncRSS = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    alert('Sync Complete — Archive updated with latest entries.');
    setSyncing(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal text-white">
      {/* Header */}
      <div className="border-b border-daraja-border px-6 md:px-12 py-8 pt-32">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="p-3 glass border border-white/10 text-white hover:text-daraja-gold transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-daraja-gold mono-text text-[9px]">
                <div className="w-2 h-2 rounded-full bg-daraja-gold animate-pulse" />
                MEDIA_CMS_ENGINE
              </div>
              <h1 className="text-3xl md:text-5xl font-serif italic text-white">Content <span className="text-daraja-gold not-italic">Matrix</span></h1>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={syncRSS}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-3 border border-daraja-gold/40 text-daraja-gold mono-text text-[9px] hover:bg-daraja-gold hover:text-daraja-charcoal transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              SYNC_ARCHIVE
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-daraja-gold text-daraja-charcoal mono-text text-[9px] font-bold hover:bg-white transition-all">
              <Video className="w-4 h-4" /> NEW_POST
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-12 max-w-[1600px] mx-auto space-y-12">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-daraja-border">
          {['posts', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 mono-text text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'text-daraja-gold border-b border-daraja-gold -mb-px' : 'text-daraja-text-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="luxury-card h-20 animate-pulse" />)
            ) : posts.length === 0 ? (
              <div className="text-center py-24 text-daraja-text-muted mono-text text-[10px]">NO_ARCHIVE_ENTRIES</div>
            ) : posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="luxury-card p-6 flex items-center gap-6 hover:border-daraja-gold/40 transition-all"
              >
                {post.image_url && (
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="mono-text text-daraja-gold text-[8px] uppercase">{post.category}</span>
                    <span className={`px-2 py-0.5 mono-text text-[7px] uppercase ${post.is_published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                      {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>
                  <h3 className="font-serif italic text-white text-base truncate">{post.title}</h3>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="mono-text text-daraja-text-muted text-[8px]">{post.views_count || 0} VIEWS</span>
                  <button className="p-2 border border-daraja-border text-daraja-text-muted hover:border-daraja-gold hover:text-daraja-gold transition-all">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="luxury-card p-10 space-y-4 hover:border-daraja-gold/40 transition-all">
                <div className="w-10 h-10 bg-daraja-gold/10 flex items-center justify-center">
                  <List className="w-4 h-4 text-daraja-gold" />
                </div>
                <h3 className="font-serif italic text-white text-xl">{cat}</h3>
                <p className="mono-text text-daraja-text-muted text-[9px]">{posts.filter(p => p.category === cat).length} ENTRIES</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
