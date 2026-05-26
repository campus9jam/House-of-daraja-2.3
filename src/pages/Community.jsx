import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RefreshCw, ExternalLink, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Dandali', 'Zare Global', 'Co-Creators'];

const DEMO_VIDEOS = [
  { youtubeId: 'dQw4w9WgXcQ', title: 'Heritage Textile Archive: Sahel Weaving Traditions', category: 'Dandali',      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', publishedAt: new Date().toISOString() },
  { youtubeId: 'ScMzIvxBSi4', title: 'Zare Global: Pan-African Fashion Forward', category: 'Zare Global',   thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg', publishedAt: new Date().toISOString() },
  { youtubeId: 'jNQXAC9IVRw', title: 'Co-Creator Spotlight: Lagos Artisan Collective', category: 'Co-Creators',  thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg', publishedAt: new Date().toISOString() },
  { youtubeId: 'kffacxfA7G4', title: 'The Indigo Fermentation Process — Kano Documentary', category: 'Dandali',      thumbnail: 'https://img.youtube.com/vi/kffacxfA7G4/hqdefault.jpg', publishedAt: new Date().toISOString() },
];

export default function Community() {
  const [videos, setVideos] = useState(DEMO_VIDEOS);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = videos.filter(v =>
    (category === 'All' || v.category === category) &&
    (v.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/youtube/rss?channelId=UCxxxxxx');
      const data = await res.json();
      if (data.items?.length > 0) setVideos(data.items);
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto space-y-16">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-daraja-border pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
              <div className="w-2 h-2 rounded-full bg-daraja-gold animate-pulse" />
              <span>COMMUNITY_ARCHIVE_NODE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
              Media <span className="text-daraja-gold not-italic">Archive</span>
            </h1>
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 border border-daraja-gold/40 text-daraja-gold mono-text text-[9px] hover:bg-daraja-gold hover:text-daraja-charcoal transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            SYNC_RSS_ARCHIVE
          </button>
        </header>

        {/* Player Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
            <div className="w-full max-w-4xl space-y-4" onClick={e => e.stopPropagation()}>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${selected.youtubeId}?autoplay=1`}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="mono-text text-daraja-gold text-[9px] uppercase">{selected.category}</p>
                  <h3 className="font-serif italic text-white text-xl mt-1">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="mono-text text-daraja-text-muted text-[9px] hover:text-white">
                  CLOSE ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 mono-text text-[9px] uppercase tracking-widest transition-all ${
                  category === c ? 'bg-daraja-gold text-daraja-charcoal' : 'border border-daraja-border text-daraja-text-muted hover:border-daraja-gold hover:text-daraja-gold'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-daraja-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH_ARCHIVE..."
              className="bg-daraja-surface border border-daraja-border pl-10 pr-6 py-3 text-white mono-text text-[10px] focus:border-daraja-gold outline-none w-64"
            />
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((video, i) => (
            <motion.div
              key={video.youtubeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="luxury-card overflow-hidden group cursor-pointer hover:border-daraja-gold/40 transition-all"
              onClick={() => setSelected(video)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-daraja-gold/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-daraja-charcoal fill-daraja-charcoal" />
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="mono-text text-daraja-gold text-[8px] uppercase tracking-widest">{video.category}</p>
                <h3 className="font-serif italic text-white text-sm leading-tight line-clamp-2">{video.title}</h3>
                <p className="mono-text text-daraja-text-muted text-[8px]">{new Date(video.publishedAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-24 text-daraja-text-muted mono-text text-[10px]">
              NO_ARCHIVE_ENTRIES_FOUND
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
