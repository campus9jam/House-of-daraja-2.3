import React, { useState, useEffect } from 'react';
import { HeritagePost } from '../api/entities';

const CATEGORIES = ['All', 'Story', 'Archive', 'Culture', 'Textile', 'Artisan'];

export default function Heritage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    HeritagePost.filter({ is_published: true }).then(p => {
      setPosts(p);
      if (p.length > 0) setSelectedPost(p[0]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        {selectedPost ? (
          <>
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#050505]" />
          </>
        ) : (
          <div className="w-full h-full bg-[#0E0E0E]" />
        )}
        <div className="absolute bottom-0 left-0 px-6 md:px-16 pb-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs uppercase tracking-[0.4em]">The Archive</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white font-light">Heritage</h1>
        </div>
      </div>

      <div className="px-6 md:px-16 max-w-7xl mx-auto py-12">
        {/* Category Filter */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 border-b border-white/5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs uppercase tracking-[0.3em] whitespace-nowrap pb-4 border-b-2 transition-all ${
                activeCategory === cat
                  ? 'border-[#C5A059] text-[#C5A059]'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-white/5 mb-4" />
                <div className="h-4 bg-white/5 mb-2 w-1/3" />
                <div className="h-6 bg-white/5 mb-1" />
                <div className="h-6 bg-white/5 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 font-serif text-2xl">No stories in this category</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {filtered[0] && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
                <div className="lg:col-span-3">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={filtered[0].image_url} alt={filtered[0].title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-3">{filtered[0].category}</div>
                  <h2 className="text-3xl md:text-4xl font-serif text-white font-light leading-tight mb-6">
                    {filtered[0].title}
                  </h2>
                  <p className="text-white/50 leading-relaxed text-sm line-clamp-4">
                    {filtered[0].content}
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <span className="text-white/30 text-xs uppercase tracking-[0.2em]">{filtered[0].author_name}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30 text-xs">{filtered[0].views_count?.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of posts */}
            {filtered.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.slice(1).map(post => (
                  <article
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[16/10] overflow-hidden mb-4">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-[#C5A059] text-[10px] uppercase tracking-[0.3em] mb-2">{post.category}</div>
                    <h3 className="text-white font-serif text-xl leading-tight mb-3 group-hover:text-[#C5A059] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-white/30 text-xs">{post.author_name}</span>
                      {post.views_count > 0 && (
                        <>
                          <span className="text-white/20">·</span>
                          <span className="text-white/20 text-xs">{post.views_count?.toLocaleString()} views</span>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
