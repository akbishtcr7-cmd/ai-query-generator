import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDatabase, FiPlus, FiPlay, FiRefreshCw, FiTrash2,
  FiChevronLeft, FiLock, FiShield, FiServer, FiInfo, FiTable,
} from 'react-icons/fi';
import { sandboxService } from '../services/sandboxService';
import VirtualTableViewer from '../components/sandbox/VirtualTableViewer';
import SimulationResult from '../components/sandbox/SimulationResult';
import SandboxPasswordModal from '../components/sandbox/SandboxPasswordModal';
import CreateTableModal from '../components/sandbox/CreateTableModal';
import Loader from '../components/common/Loader';

const DB_TYPES = ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle SQL', 'SQL Server'];

// ── Create Sandbox Form ────────────────────────────────────────────────────────
const CreateSandboxForm = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState({ name: '', databaseType: 'MySQL', description: '', sandboxPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.databaseType) { setError('Name and type are required'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await sandboxService.create(form);
      onCreated(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sandbox');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Create Virtual Sandbox</h2>
        <p className="text-gray-500 text-sm mt-1">
          Describe your database — we'll generate virtual tables with dummy data. Your real DB is never connected.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/20">
        <FiShield className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-sm text-green-400 font-medium">100% Safe — No Real Connection</p>
          <p className="text-xs text-green-400/60 mt-0.5">
            We never store or request real DB credentials. Gemini AI creates a virtual replica using dummy data only.
          </p>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Sandbox Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. My Ecommerce DB" className="input-field" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Database Type</label>
            <select value={form.databaseType} onChange={e => set('databaseType', e.target.value)} className="input-field">
              {DB_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">
            Describe Your Database
            <span className="text-gray-600 text-xs ml-2">(optional — Gemini will infer tables from this)</span>
          </label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="e.g. An ecommerce platform with users, products, orders and reviews. Users place orders, orders have many products..."
            rows={4} className="input-field resize-none" />
          <p className="text-xs text-gray-600 mt-1">Leave blank to start with an empty sandbox and add tables manually.</p>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1.5">
            <FiLock size={13} /> Sandbox Password
            <span className="text-gray-600 text-xs">(required for GRANT / DROP / TRUNCATE simulation)</span>
          </label>
          <input type="password" value={form.sandboxPassword} onChange={e => set('sandboxPassword', e.target.value)}
            placeholder="Set a sandbox password..." className="input-field" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader size="sm" /> Generating...</> : <><FiDatabase size={15} /> Create Sandbox</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// ── Main Sandbox Page ──────────────────────────────────────────────────────────
const Sandbox = () => {
  const [sandboxes, setSandboxes]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [creating, setCreating]           = useState(false);
  const [activeSandbox, setActiveSandbox] = useState(null);
  const [query, setQuery]                 = useState('');
  const [simulating, setSimulating]       = useState(false);
  const [simResult, setSimResult]         = useState(null);
  const [simError, setSimError]           = useState('');
  const [passwordModal, setPasswordModal] = useState(false);
  const [pendingQuery, setPendingQuery]   = useState('');
  const [createTableOpen, setCreateTableOpen] = useState(false);

  useEffect(() => { fetchSandboxes(); }, []);

  const fetchSandboxes = async () => {
    try {
      setLoading(true);
      const { data } = await sandboxService.getAll();
      setSandboxes(data.data);
    } catch {} finally { setLoading(false); }
  };

  const handleCreated = (sandbox) => {
    setSandboxes(s => [sandbox, ...s]);
    setCreating(false);
    openSandbox(sandbox._id);
  };

  const openSandbox = async (id) => {
    try {
      const { data } = await sandboxService.getOne(id);
      setActiveSandbox(data.data);
      setSimResult(null);
      setQuery('');
    } catch {}
  };

  const handleTableCreated = (updatedSandbox) => {
    setActiveSandbox(updatedSandbox);
    setCreateTableOpen(false);
  };

  const runSimulation = async (q, password) => {
    setSimulating(true); setSimError(''); setSimResult(null);
    try {
      const { data } = await sandboxService.simulate(activeSandbox._id, { query: q, sandboxPassword: password });
      setSimResult(data.data);
      // Refresh sandbox to show updated virtual data
      const refreshed = await sandboxService.getOne(activeSandbox._id);
      setActiveSandbox(refreshed.data.data);
    } catch (err) {
      const res = err.response?.data;
      if (res?.requiresPassword) {
        setPendingQuery(q);
        setPasswordModal(true);
      } else {
        setSimError(res?.message || 'Simulation failed');
      }
    } finally { setSimulating(false); }
  };

  const handleRunQuery = () => {
    if (!query.trim() || simulating) return;
    runSimulation(query.trim());
  };

  const handlePasswordConfirm = (password) => {
    setPasswordModal(false);
    runSimulation(pendingQuery, password);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all virtual data to fresh dummy data?')) return;
    try {
      await sandboxService.reset(activeSandbox._id);
      openSandbox(activeSandbox._id);
      setSimResult(null);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sandbox?')) return;
    try {
      await sandboxService.delete(id);
      setSandboxes(s => s.filter(x => x._id !== id));
      if (activeSandbox?._id === id) setActiveSandbox(null);
    } catch {}
  };

  // ── Sandbox list view ────────────────────────────────────────────────────────
  if (!activeSandbox && !creating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiServer className="text-purple-400" /> Query Sandbox
            </h1>
            <p className="text-gray-500 text-sm mt-1">Test queries on virtual databases — real data always stays safe</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <FiPlus size={15} /> New Sandbox
          </button>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📝', title: 'Describe or Build', desc: 'Describe your DB to auto-generate tables, or add them manually with the table builder' },
            { icon: '🧬', title: 'AI Fills Dummy Data', desc: 'Gemini creates realistic dummy rows based on your column names and types' },
            { icon: '🧪', title: 'Test Safely', desc: 'Run any query — see live results on virtual data. Real DB is never touched.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card text-center py-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="font-semibold text-white text-sm">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader text="Loading sandboxes..." /></div>
        ) : sandboxes.length === 0 ? (
          <div className="card text-center py-16">
            <FiDatabase className="mx-auto text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 mb-4">No sandboxes yet</p>
            <button onClick={() => setCreating(true)} className="btn-primary mx-auto flex items-center gap-2">
              <FiPlus size={14} /> Create First Sandbox
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sandboxes.map((sb, i) => (
              <motion.div key={sb._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="card hover:border-purple-500/40 transition-all cursor-pointer group"
                onClick={() => openSandbox(sb._id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <FiDatabase size={14} className="text-white" />
                      </div>
                      <span className="font-semibold text-white">{sb.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{sb.databaseType}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{sb.tables?.length || 0} virtual tables</p>
                    {sb.sandboxPassword && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-1">
                        <FiLock size={10} /> Password protected
                      </span>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(sb._id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400">
                    <FiTrash2 size={13} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(sb.tables || []).slice(0, 5).map(t => (
                    <span key={t.tableName} className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                      {t.tableName}
                    </span>
                  ))}
                  {(sb.tables || []).length > 5 && <span className="text-xs text-gray-600">+{sb.tables.length - 5} more</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Create form ──────────────────────────────────────────────────────────────
  if (creating) {
    return (
      <div className="space-y-4">
        <button onClick={() => setCreating(false)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <FiChevronLeft size={16} /> Back
        </button>
        <CreateSandboxForm onCreated={handleCreated} onCancel={() => setCreating(false)} />
      </div>
    );
  }

  // ── Active Sandbox detail view ───────────────────────────────────────────────
  const tables = activeSandbox?.tableSummary || activeSandbox?.tables || [];
  const firstTable = tables[0]?.tableName || 'table';
  const secondTable = tables[1]?.tableName;

  const exampleQueries = [
    `SELECT * FROM ${firstTable} LIMIT 5`,
    `SELECT COUNT(*) FROM ${firstTable}`,
    secondTable
      ? `SELECT a.*, b.* FROM ${firstTable} a JOIN ${secondTable} b ON a.id = b.${firstTable}_id LIMIT 5`
      : `SELECT * FROM ${firstTable} WHERE id = 1`,
    `DELETE FROM ${firstTable} WHERE id = 10`,
    `GRANT SELECT ON ${firstTable} TO 'testuser'`,
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveSandbox(null)}
            className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <FiChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {activeSandbox.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {activeSandbox.databaseType}
              </span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <FiShield size={10} className="text-green-400" />
              Virtual sandbox — real database is never affected
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCreateTableOpen(true)}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <FiTable size={12} /> Add Table
          </button>
          <button onClick={handleReset} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <FiRefreshCw size={12} /> Reset Data
          </button>
          <button onClick={() => setCreating(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <FiPlus size={12} /> New Sandbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Virtual tables panel */}
        <div className="xl:col-span-1 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Virtual Tables</h3>
            <button onClick={() => setCreateTableOpen(true)}
              className="text-xs px-2.5 py-1.5 glass rounded-lg text-purple-400 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-1">
              <FiPlus size={11} /> Add Table
            </button>
          </div>
          <VirtualTableViewer tables={tables} onRefresh={() => openSandbox(activeSandbox._id)} />
        </div>

        {/* Right: Query runner */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Run Query on Virtual Data</h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <FiShield size={10} /> Simulated only
              </div>
            </div>

            {/* Quick example queries */}
            <div className="flex flex-wrap gap-2">
              {exampleQueries.slice(0, 4).map((ex, i) => (
                <button key={i} onClick={() => setQuery(ex)}
                  className="text-xs px-3 py-1.5 glass rounded-lg text-gray-400 hover:text-purple-400 border border-white/10 hover:border-purple-500/40 transition-all font-mono truncate max-w-xs">
                  {ex.length > 48 ? ex.substring(0, 48) + '…' : ex}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleRunQuery()}
                placeholder={`Write a ${activeSandbox.databaseType} query here...\n(Ctrl+Enter to run)`}
                rows={5}
                className="input-field resize-none font-mono text-sm text-green-300 placeholder-gray-600"
              />
            </div>

            {simError && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {simError}
              </div>
            )}

            <button onClick={handleRunQuery} disabled={!query.trim() || simulating}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {simulating
                ? <><Loader size="sm" /> Simulating on virtual data...</>
                : <><FiPlay size={15} /> Run Virtual Simulation</>}
            </button>

            <div className="flex items-start gap-2 text-xs text-gray-600">
              <FiInfo size={12} className="flex-shrink-0 mt-0.5 text-blue-500" />
              <span>
                <strong className="text-gray-500">GRANT / REVOKE / DROP / TRUNCATE</strong> require your sandbox password first.
                All results are simulated — your real database is <strong className="text-gray-500">never touched</strong>.
              </span>
            </div>
          </div>

          {/* Simulation result */}
          <AnimatePresence>
            {simResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card">
                <SimulationResult result={simResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Password modal */}
      <SandboxPasswordModal
        open={passwordModal}
        queryPreview={pendingQuery}
        onConfirm={handlePasswordConfirm}
        onCancel={() => { setPasswordModal(false); setPendingQuery(''); }}
      />

      {/* Create Table modal */}
      <CreateTableModal
        open={createTableOpen}
        sandboxId={activeSandbox._id}
        onCreated={handleTableCreated}
        onClose={() => setCreateTableOpen(false)}
      />
    </div>
  );
};

export default Sandbox;
