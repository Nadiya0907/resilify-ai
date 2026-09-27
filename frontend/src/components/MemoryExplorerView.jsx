import React, { useState, useEffect } from 'react';
import { Database, Search, Sparkles, FileText, CheckCircle2, Tag } from 'lucide-react';

export default function MemoryExplorerView({ memoryData, onSearchRecall }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const memories = memoryData?.memories || [];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    if (onSearchRecall) {
      const res = await onSearchRecall(searchQuery);
      setSearchResults(res);
    }
    setIsSearching(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="var(--accent-cyan)" />
            SRE Organizational Incident Memory Bank
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Explore persistent organizational incident knowledge stored in Vectorize Hindsight memory bank (<span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>sre-incidents-bank</span>).
          </p>
        </div>

        <span style={{ 
          background: 'rgba(16,185,129,0.15)', 
          color: 'var(--accent-emerald)', 
          padding: '6px 14px', 
          borderRadius: '20px', 
          fontWeight: 700, 
          fontSize: '0.85rem' 
        }}>
          {memories.length} Post-Mortem Memories Stored
        </span>
      </div>

      {/* Semantic Memory Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search memories by symptom or service (e.g., 'payment database connection pool' or 'JWT RSS leak')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)'
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={isSearching} style={{ padding: '0 20px' }}>
          <Search size={16} />
          {isSearching ? 'Recall Searching...' : 'Recall Query'}
        </button>
      </form>

      {/* Search Recall Results */}
      {searchResults && (
        <div style={{ marginBottom: '24px', background: 'rgba(0,240,255,0.04)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(0,240,255,0.2)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '12px' }}>
            Hindsight Recall Similarity Search for: "{searchResults.query}" ({searchResults.results?.length || 0} Matches)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {searchResults.results?.map((res, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    Hindsight Match Score: {Math.round(res.score * 100)}%
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {res.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                  {res.metadata?.title || res.content.substring(0, 100)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stored Post-Mortems List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {memories.map((mem) => (
          <div 
            key={mem.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--accent-cyan)" />
                <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {mem.id}
                </span>
                {mem.metadata?.service && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    {mem.metadata.service}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {new Date(mem.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              {mem.metadata?.title || 'Incident Memory Entry'}
            </h4>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {mem.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
