import React, { useState, useEffect } from 'react';
import { Database, Search, Plus, Sparkles, X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function MemoryInspectorModal({ isOpen, onClose, memoryData, onSearchRecall, onAddMemory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newService, setNewService] = useState('payment-gateway');
  const [newContent, setNewContent] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  if (!isOpen) return null;

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (onAddMemory) {
      await onAddMemory({
        content: newContent,
        metadata: {
          title: newTitle || 'Custom Post-Mortem',
          service: newService,
          symptoms: newContent
        }
      });
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddForm(false);
        setNewTitle('');
        setNewContent('');
      }, 1500);
    }
  };

  const memoriesList = memoryData?.memories || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 0 40px rgba(0,240,255,0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Hindsight Memory Inspector
              </h3>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                Bank: sre-incidents-bank ({memoriesList.length} Entries)
              </span>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '6px 12px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Recall Search Test Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              Live Memory Recall Tester (Vector Similarity Query)
            </h4>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter symptom query (e.g. 'HikariCP connection pool timeout' or 'JWT RAM leak')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              <button className="btn btn-primary" type="submit" disabled={isSearching}>
                <Search size={16} />
                {isSearching ? 'Querying...' : 'Recall'}
              </button>
            </form>

            {searchResults && (
              <div style={{ marginTop: '14px', background: 'rgba(0,240,255,0.04)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0,240,255,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '8px' }}>
                  Recall Results for: "{searchResults.query}" ({searchResults.results?.length || 0} matches)
                </div>
                {searchResults.results?.map((res, i) => (
                  <div key={i} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        Score: {Math.round(res.score * 100)}% Match
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {res.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                      {res.metadata?.title || res.content.substring(0, 100)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Memory Form Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Stored Post-Mortem Memories in Hindsight
            </h4>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              {showAddForm ? 'Cancel Form' : 'Add Custom Memory'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddSubmit} style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px dashed var(--accent-cyan)',
              marginBottom: '20px' 
            }}>
              <h5 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                Retain New Incident Knowledge into Hindsight Bank
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text"
                  placeholder="Post-Mortem Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <select 
                  value={newService} 
                  onChange={(e) => setNewService(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="payment-gateway">payment-gateway</option>
                  <option value="auth-service">auth-service</option>
                  <option value="redis-cluster">redis-cluster</option>
                  <option value="db-primary">db-primary</option>
                </select>
              </div>

              <textarea 
                placeholder="Enter post-mortem symptoms, root cause, and runbook resolution steps..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: '10px'
                }}
              />

              <button className="btn btn-primary" type="submit" style={{ fontSize: '0.85rem' }}>
                {addSuccess ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                {addSuccess ? 'Memory Retained!' : 'Retain to Hindsight Bank'}
              </button>
            </form>
          )}

          {/* Memories List Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {memoriesList.map((mem) => (
              <div 
                key={mem.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="var(--accent-cyan)" />
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {mem.id}
                    </span>
                    {mem.metadata?.service && (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {mem.metadata.service}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {mem.metadata?.title || 'Incident Memory Entry'}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                  {mem.content}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
