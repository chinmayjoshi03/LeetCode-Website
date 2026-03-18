import { useState, useMemo, useCallback } from 'react';
import { ALL_PROBLEMS } from './data/problems';
import './index.css';

const STORAGE_KEY = 'leetcode-tracker-solved';

function loadSolved() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch { return new Set(); }
}

function saveSolved(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function App() {
  const [solvedSet, setSolvedSet] = useState(loadSolved);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [showFilter, setShowFilter] = useState('All'); // All, Solved, Unsolved

  const topics = useMemo(() => {
    const map = {};
    ALL_PROBLEMS.forEach(p => {
      if (!map[p.topic]) map[p.topic] = 0;
      map[p.topic]++;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const toggleSolved = useCallback((id) => {
    setSolvedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSolved(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    return ALL_PROBLEMS.filter(p => {
      if (topicFilter !== 'All' && p.topic !== topicFilter) return false;
      if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
      if (showFilter === 'Solved' && !solvedSet.has(p.id)) return false;
      if (showFilter === 'Unsolved' && solvedSet.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || String(p.number).includes(q);
      }
      return true;
    });
  }, [topicFilter, diffFilter, showFilter, search, solvedSet]);

  const stats = useMemo(() => {
    const total = ALL_PROBLEMS.length;
    const solved = solvedSet.size;
    const byDiff = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    ALL_PROBLEMS.forEach(p => {
      if (byDiff[p.difficulty]) {
        byDiff[p.difficulty].total++;
        if (solvedSet.has(p.id)) byDiff[p.difficulty].solved++;
      }
    });
    return { total, solved, byDiff, pct: total ? Math.round((solved / total) * 100) : 0 };
  }, [solvedSet]);

  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (circumference * stats.pct) / 100;

  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      setSolvedSet(new Set());
      saveSolved(new Set());
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">LC</div>
            <div>
              <h1>LeetCode Tracker</h1>
              <span>Master your DSA journey</span>
            </div>
          </div>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="text"
              placeholder="Search problems by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-input"
            />
          </div>
          <div className="header-stats">
            <div className="stat-pill solved">
              <span>✓</span>
              <span className="stat-num">{stats.solved}</span>
              <span>/ {stats.total}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          {/* Progress Card */}
          <div className="progress-card">
            <div className="progress-ring-container">
              <div className="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle className="bg" cx="40" cy="40" r="34" />
                  <circle className="fg" cx="40" cy="40" r="34"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset} />
                </svg>
                <div className="center-text">{stats.pct}%</div>
              </div>
              <div className="progress-stats">
                <div className="label">Problems Solved</div>
                <div className="value">{stats.solved}</div>
                <div className="label">of {stats.total} total</div>
              </div>
            </div>
            <div className="progress-bars">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <div className="progress-bar-row" key={d}>
                  <span className={`label ${d.toLowerCase()}`}>{d}</span>
                  <div className="progress-bar-track">
                    <div className={`progress-bar-fill ${d.toLowerCase()}`}
                      style={{ width: stats.byDiff[d].total ? `${(stats.byDiff[d].solved / stats.byDiff[d].total) * 100}%` : '0%' }} />
                  </div>
                  <span className="nums">{stats.byDiff[d].solved}/{stats.byDiff[d].total}</span>
                </div>
              ))}
            </div>
            <button className="reset-btn" onClick={handleReset}>Reset All Progress</button>
          </div>

          {/* Difficulty Filter */}
          <div className="sidebar-section">
            <h3>Difficulty</h3>
            <div className="diff-filters">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button key={d}
                  className={`diff-btn ${d.toLowerCase()} ${diffFilter === d ? 'active' : ''}`}
                  onClick={() => setDiffFilter(diffFilter === d ? 'All' : d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div className="sidebar-section">
            <h3>Topics</h3>
            <button className={`filter-btn ${topicFilter === 'All' ? 'active' : ''}`}
              onClick={() => setTopicFilter('All')}>
              All Topics <span className="count">{ALL_PROBLEMS.length}</span>
            </button>
            {topics.map(([topic, count]) => (
              <button key={topic}
                className={`filter-btn ${topicFilter === topic ? 'active' : ''}`}
                onClick={() => setTopicFilter(topicFilter === topic ? 'All' : topic)}>
                {topic} <span className="count">{count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="content-header">
            <div>
              <h2>{topicFilter === 'All' ? 'All Problems' : topicFilter}</h2>
              <span className="problem-count">{filtered.length} problems</span>
            </div>
            <div className="show-filter">
              {['All', 'Unsolved', 'Solved'].map(f => (
                <button key={f}
                  className={`show-btn ${showFilter === f ? 'active' : ''}`}
                  onClick={() => setShowFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="problems-table">
            <div className="table-header">
              <span></span>
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Topic</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No problems match your filters</p>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id}
                  className={`problem-row ${solvedSet.has(p.id) ? 'solved-row' : ''}`}
                  style={{ animationDelay: '0ms' }}>
                  <div className="checkbox-cell">
                    <div className={`checkbox ${solvedSet.has(p.id) ? 'checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleSolved(p.id); }}
                      role="checkbox"
                      aria-checked={solvedSet.has(p.id)}
                      tabIndex={0}
                      id={`check-${p.id}`}
                    />
                  </div>
                  <span className="problem-number">{p.number}</span>
                  <div className="problem-title-cell">
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a>
                  </div>
                  <span className={`difficulty-badge ${p.difficulty}`}>{p.difficulty}</span>
                  <span className="topic-badge">{p.topic}</span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
