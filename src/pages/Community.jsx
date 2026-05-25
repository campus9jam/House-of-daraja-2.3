import React, { useState, useEffect } from 'react';

const HD_CHANNEL_ID = 'UC_placeholder'; // Replace with real HD YouTube Channel ID

export default function Community() {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState(HD_CHANNEL_ID);

  // Featured static videos as fallback while channel ID is configured
  const FEATURED_VIDEOS = [
    {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'House of Daraja — The Heritage Collection',
      pubDate: '2026-05-01',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      author: 'House of Daraja',
    },
    {
      youtubeId: 'L_jWHffIx5E',
      title: 'Sahelian Aesthetics: Behind the Design',
      pubDate: '2026-04-20',
      thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/hqdefault.jpg',
      author: 'House of Daraja',
    },
    {
      youtubeId: 'kJQP7kiw5Fk',
      title: 'Atelier Process — Bespoke Tailoring in Lagos',
      pubDate: '2026-04-10',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      author: 'House of Daraja',
    },
    {
      youtubeId: '3tmd-ClpJxA',
      title: 'Drop 001 — Sovereign Series Launch',
      pubDate: '2026-03-28',
      thumbnail: 'https://img.youtube.com/vi/3tmd-ClpJxA/hqdefault.jpg',
      author: 'House of Daraja',
    },
    {
      youtubeId: 'JGwWNGJdvx8',
      title: 'Neural Link — The Technology Behind Leema AI',
      pubDate: '2026-03-15',
      thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      author: 'House of Daraja',
    },
    {
      youtubeId: 'hT_nvWreIhg',
      title: 'HD Lookbook — Spring Sovereignty',
      pubDate: '2026-03-01',
      thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg',
      author: 'House of Daraja',
    },
  ];

  useEffect(() => {
    fetchYouTubeFeed();
  }, []);

  const fetchYouTubeFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/functions/youtubeFeed?channelId=${channelId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length) {
          setVideos(data.items);
          setSelected(data.items[0]);
          setLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback to static featured content
    setVideos(FEATURED_VIDEOS);
    setSelected(FEATURED_VIDEOS[0]);
    setLoading(false);
  };

  const handleVideoSelect = (video) => {
    setSelected(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="px-6 md:px-16 py-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Media Archive</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white font-light">Community</h1>
        <p className="text-white/40 mt-3 max-w-lg">The sovereign media archive. Official films, behind-the-scenes, and brand documentaries.</p>
      </div>

      <div className="px-6 md:px-16 pb-20 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#C5A059] animate-pulse">Loading archive...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main player — 62% */}
            <div className="lg:col-span-3">
              {selected && (
                <>
                  <div className="aspect-video bg-black mb-4">
                    <iframe
                      key={selected.youtubeId}
                      src={`https://www.youtube.com/embed/${selected.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={selected.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h2 className="text-white font-serif text-2xl font-light mb-2">{selected.title}</h2>
                  <div className="flex items-center gap-4 text-white/40 text-sm">
                    <span>{selected.author || 'House of Daraja'}</span>
                    <span>·</span>
                    <span>{selected.pubDate ? new Date(selected.pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Heritage', 'Luxury', 'African Fashion', 'Sovereign'].map(tag => (
                      <span key={tag} className="bg-white/5 border border-white/10 text-white/40 text-xs px-3 py-1 uppercase tracking-[0.15em]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Video list — 38% */}
            <div className="lg:col-span-2">
              <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Archive</div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {videos.map((video, i) => (
                  <button
                    key={video.youtubeId + i}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full flex gap-3 p-3 text-left transition-all ${
                      selected?.youtubeId === video.youtubeId
                        ? 'bg-[#C5A059]/10 border border-[#C5A059]/30'
                        : 'bg-[#0E0E0E] border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-24 h-16 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          selected?.youtubeId === video.youtubeId ? 'bg-[#C5A059] text-black' : 'bg-black/60 text-white'
                        }`}>▶</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-snug line-clamp-2 ${
                        selected?.youtubeId === video.youtubeId ? 'text-white' : 'text-white/70'
                      }`}>{video.title}</div>
                      <div className="text-white/30 text-xs mt-1">
                        {video.pubDate ? new Date(video.pubDate).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="mt-16 border border-[#C5A059]/20 bg-[#C5A059]/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-2">Subscribe</div>
            <h3 className="text-white font-serif text-2xl font-light">Never miss a sovereign drop</h3>
            <p className="text-white/40 text-sm mt-1">Subscribe on YouTube for exclusive behind-the-scenes content.</p>
          </div>
          <a
            href={`https://www.youtube.com/channel/${channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-8 py-3 text-sm uppercase tracking-[0.2em] font-bold hover:bg-red-500 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span>▶</span> Subscribe
          </a>
        </div>
      </div>
    </div>
  );
}
