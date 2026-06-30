import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash2, FiTable, FiKey, FiAlertCircle } from 'react-icons/fi';
import Loader from '../common/Loader';

const COLUMN_TYPES = ['INT','VARCHAR','TEXT','BOOLEAN','DATE','DATETIME','FLOAT','DECIMAL','BIGINT','JSON'];
const emptyCol = () => ({ name: '', type: 'VARCHAR', isPrimary: false, isNullable: true });

const CreateTableModal = ({ open, sandboxId, onCreated, onClose }) => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns]     = useState([emptyCol()]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const reset = () => { setTableName(''); setColumns([emptyCol()]); setError(''); };
  const handleClose = () => { reset(); onClose(); };
  const addCol    = () => setColumns(c => [...c, emptyCol()]);
  const removeCol = (i) => setColumns(c => c.filter((_, idx) => idx !== i));
  const updateCol = (i, field, value) => setColumns(c => c.map((col, idx) => idx === i ? { ...col, [field]: value } : col));
  const setPrimary = (i) => setColumns(c => c.map((col, idx) => ({ ...col, isPrimary: idx === i })));

  const validate = () => {
    if (!tableName.trim()) return 'Table name is required';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName.trim())) return 'Table name: letters, numbers, underscores only';
    if (!columns.length) return 'Add at least one column';
    for (const col of columns) {
      if (!col.name.trim()) return 'All columns need a name';
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name.trim())) return `Invalid column name: "${col.name}"`;
    }
    const names = columns.map(c => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return 'Column names must be unique';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const { sandboxService } = await import('../../services/sandboxService');
      const { data } = await sandboxService.addTable(sandboxId, {
        tableName: tableName.trim(),
        columns: columns.map(c => ({ ...c, name: c.name.trim() })),
        rowCount: 10,
      });
      reset();
      onCreated(data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create table');
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          <motion.div initial={{ scale:0.9,opacity:0,y:20 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:0.9,opacity:0,y:20 }}
            className="relative glass-dark border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <FiTable size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Create Virtual Table</h3>
                  <p className="text-xs text-gray-500">Define schema — 10 dummy rows auto-generated</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors"><FiX size={20} /></button>
            </div>

            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1.5 block">Table Name</label>
              <input value={tableName} onChange={e => setTableName(e.target.value)}
                placeholder="e.g. users, orders, products" className="input-field font-mono" />
              <p className="text-xs text-gray-600 mt-1">Lowercase with underscores: <span className="font-mono text-gray-500">order_items</span></p>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-400">Columns ({columns.length})</label>
                <button onClick={addCol}
                  className="text-xs px-3 py-1.5 glass rounded-lg text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-1.5">
                  <FiPlus size={12} /> Add Column
                </button>
              </div>

              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-4 text-xs text-gray-600">Column Name</div>
                <div className="col-span-3 text-xs text-gray-600">Type</div>
                <div className="col-span-2 text-xs text-gray-600 text-center">Primary Key</div>
                <div className="col-span-2 text-xs text-gray-600 text-center">Nullable</div>
                <div className="col-span-1" />
              </div>

              <div className="space-y-2">
                {columns.map((col, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 relative">
                      {col.isPrimary && <FiKey size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />}
                      <input value={col.name} onChange={e => updateCol(i,'name',e.target.value)}
                        placeholder={i === 0 ? 'id' : `col_${i+1}`}
                        className={`input-field text-sm py-2 font-mono ${col.isPrimary ? 'pl-8' : ''}`} />
                    </div>
                    <div className="col-span-3">
                      <select value={col.type} onChange={e => updateCol(i,'type',e.target.value)} className="input-field text-sm py-2">
                        {COLUMN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button onClick={() => setPrimary(i)} title="Set primary key"
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          col.isPrimary ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'glass border-white/10 text-gray-600 hover:text-amber-400 hover:border-amber-500/30'}`}>
                        <FiKey size={13} />
                      </button>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button onClick={() => updateCol(i,'isNullable',!col.isNullable)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                          col.isNullable ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {col.isNullable ? 'NULL' : 'NOT NULL'}
                      </button>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeCol(i)} disabled={columns.length === 1}
                        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-5 text-xs text-purple-300">
              <span className="text-lg leading-none">🎲</span>
              <span>
                <strong>10 realistic dummy rows</strong> auto-generated from column names.
                {' '}<span className="font-mono">email</span> → fake emails,{' '}
                <span className="font-mono">name</span> → Indian names,{' '}
                <span className="font-mono">amount</span> → numbers,{' '}
                <span className="font-mono">status</span> → active/inactive, etc.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                <FiAlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader size="sm" /> Creating...</> : <><FiTable size={14} /> Create Table</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTableModal;
