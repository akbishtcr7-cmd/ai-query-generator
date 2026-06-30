import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTable, FiChevronDown, FiChevronRight, FiRefreshCw, FiKey } from 'react-icons/fi';

const VirtualTableViewer = ({ tables, onRefresh }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (name) => setExpanded(e => ({ ...e, [name]: !e[name] }));

  if (!tables?.length) return (
    <div className="text-center py-8 text-gray-600 text-sm">
      No tables yet. Create a sandbox to see virtual data.
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Virtual Tables ({tables.length})</p>
        {onRefresh && (
          <button onClick={onRefresh} className="text-gray-500 hover:text-purple-400 transition-colors" title="Reset data">
            <FiRefreshCw size={14} />
          </button>
        )}
      </div>

      {tables.map((table) => {
        const isOpen = expanded[table.tableName];
        const cols = table.columns || [];
        const rows = table.rows || table.sampleRows || [];

        return (
          <div key={table.tableName} className="glass rounded-xl border border-white/10 overflow-hidden">
            {/* Table header */}
            <button
              onClick={() => toggle(table.tableName)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FiTable size={14} className="text-purple-400" />
                <span className="font-mono text-sm text-white font-medium">{table.tableName}</span>
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  {table.rowCount ?? rows.length} rows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{cols.length} cols</span>
                {isOpen ? <FiChevronDown size={14} className="text-gray-400" /> : <FiChevronRight size={14} className="text-gray-400" />}
              </div>
            </button>

            {/* Column schema */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Schema row */}
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-b border-white/5">
                    {cols.map(col => (
                      <span key={col.name} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        {col.isPrimary && <FiKey size={9} className="text-amber-400" />}
                        <span className="font-mono">{col.name}</span>
                        <span className="text-purple-500">:{col.type}</span>
                      </span>
                    ))}
                  </div>

                  {/* Data rows */}
                  {rows.length > 0 ? (
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-white/5">
                            {cols.map(col => (
                              <th key={col.name} className="text-left px-3 py-2 text-gray-500 font-mono whitespace-nowrap">
                                {col.isPrimary && '🔑 '}{col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              {cols.map(col => (
                                <td key={col.name} className="px-3 py-2 text-gray-300 font-mono whitespace-nowrap max-w-32 truncate" title={String(row[col.name] ?? '')}>
                                  {row[col.name] === null || row[col.name] === undefined
                                    ? <span className="text-gray-600 italic">null</span>
                                    : String(row[col.name])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-xs text-gray-600 italic">No rows</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default VirtualTableViewer;
