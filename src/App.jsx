import { useState, useMemo, useCallback, useEffect } from 'react';
import { ALL_PROBLEMS } from './data/problems';
import { Search, Code2, BookOpen, CheckCircle2, Circle, ListFilter, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (circumference * stats.pct) / 100;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      setSolvedSet(new Set());
      saveSolved(new Set());
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="logo"
          >
            <div className="logo-icon">
              <Code2 size={24} />
            </div>
            <div className="logo-text">
              <h1>CodeTrack</h1>
              <span>Master Your DSA Journey</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="search-container"
          >
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search problems by name or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search" onClick={() => setSearch('')}>
                  &times;
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="header-stats"
          >
            <div className="global-progress">
              <div className="progress-text">
                <span className="label">Overall Progress</span>
                <span className="value">{stats.pct}%</span>
              </div>
              <div className="progress-bar-mini">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="fill"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="main-layout">
        {/* SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="sidebar"
        >
          {/* Progress Card */}
          <div className="glass-card progress-card">
            <div className="card-header">
              <h3>YOUR PROGRESS</h3>
              <button
                className="reset-btn-icon"
                onClick={handleReset}
                title="Reset All Progress"
              >
                <RefreshCcw size={14} />
              </button>
            </div>

            <div className="progress-ring-container">
              <div className="progress-ring">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle className="ring-bg" cx="50" cy="50" r="40" />
                  <motion.circle
                    className="ring-fg"
                    cx="50" cy="50" r="40"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="ring-content">
                  <span className="ring-value">{stats.solved}</span>
                  <span className="ring-label">of {stats.total}</span>
                </div>
              </div>
            </div>

            <div className="difficulty-stats">
              {['Easy', 'Medium', 'Hard'].map(d => {
                const diffStats = stats.byDiff[d];
                const pct = diffStats.total ? (diffStats.solved / diffStats.total) * 100 : 0;
                return (
                  <div className="diff-stat-row" key={d}>
                    <div className="diff-stat-header">
                      <span className={`diff-label ${d.toLowerCase()}`}>{d}</span>
                      <span className="diff-nums">{diffStats.solved} / {diffStats.total}</span>
                    </div>
                    <div className="diff-bar-bg">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`diff-bar-fill ${d.toLowerCase()}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter Card */}
          <div className="glass-card filters-card">
            <div className="filters-section">
              <h3><ListFilter size={16} /> DIFFICULTY</h3>
              <div className="diff-filters">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d}
                    className={`filter-chip ${d.toLowerCase()} ${diffFilter === d ? 'active' : ''}`}
                    onClick={() => setDiffFilter(diffFilter === d ? 'All' : d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Filter Card */}
          <div className="glass-card filters-card">
            <div className="filters-section topics-section">
              <h3><BookOpen size={16} /> TOPICS</h3>
              <div className="topics-list">
                <button
                  className={`topic-btn ${topicFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setTopicFilter('All')}
                >
                  <span className="topic-name">All Topics</span>
                  <span className="topic-count">{ALL_PROBLEMS.length}</span>
                </button>
                {topics.map(([topic, count]) => (
                  <button key={topic}
                    className={`topic-btn ${topicFilter === topic ? 'active' : ''}`}
                    onClick={() => setTopicFilter(topicFilter === topic ? 'All' : topic)}
                  >
                    <span className="topic-name">{topic}</span>
                    <span className="topic-count">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* CONTENT AREA */}
        <section className="content-area">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="content-header"
          >
            <div className="header-titles">
              <h2>{topicFilter === 'All' ? 'Problem List' : `${topicFilter} Problems`}</h2>
              <span className="badge">{filtered.length} visible</span>
            </div>

            <div className="state-filters">
              {[
                { id: 'All', label: 'All' },
                { id: 'Unsolved', label: 'Todo' },
                { id: 'Solved', label: 'Done' }
              ].map(f => (
                <button key={f.id}
                  className={`state-tab ${showFilter === f.id ? 'active' : ''}`}
                  onClick={() => setShowFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="table-container glass-card"
          >
            <div className="table-header">
              <div className="col-status">Status</div>
              <div className="col-id">#</div>
              <div className="col-title">Title</div>
              <div className="col-diff">Difficulty</div>
              <div className="col-topic">Topic</div>
            </div>

            <div className="table-body">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="empty-state"
                  >
                    <div className="empty-icon-wrap">
                      <AlertCircle size={48} />
                    </div>
                    <h3>No problems found</h3>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                    <button
                      className="clear-filters-btn"
                      onClick={() => {
                        setSearch('');
                        setTopicFilter('All');
                        setDiffFilter('All');
                        setShowFilter('All');
                      }}
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                ) : (
                  filtered.map((p, index) => {
                    const isSolved = solvedSet.has(p.id);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
                        key={p.id}
                        className={`table-row ${isSolved ? 'is-solved' : ''}`}
                        onClick={() => toggleSolved(p.id)}
                      >
                        <div className="col-status">
                          <button
                            className={`status-btn ${isSolved ? 'solved' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSolved(p.id);
                            }}
                          >
                            {isSolved ? <CheckCircle2 size={20} className="check-icon" /> : <Circle size={20} className="circle-icon" />}
                          </button>
                        </div>
                        <div className="col-id font-mono">{p.number}</div>
                        <div className="col-title">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="problem-link"
                          >
                            {p.title}
                          </a>
                        </div>
                        <div className="col-diff">
                          <span className={`badge-diff ${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                        </div>
                        <div className="col-topic">
                          <span className="badge-topic">
                            {p.topic}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export default App;
