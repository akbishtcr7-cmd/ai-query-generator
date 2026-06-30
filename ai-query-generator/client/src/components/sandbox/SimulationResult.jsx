import { motion } from 'framer-motion';
import { FiCheck, FiAlertTriangle, FiInfo, FiArrowRight } from 'react-icons/fi';

const TYPE_STYLES = {
  SELECT:  { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: '🔍' },
  INSERT:  { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: '➕' },
  UPDATE:  { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: '✏️' },
  DELETE:  { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: '🗑️' },
  CREATE:  { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: '🏗️' },
  ALTER:   { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '🔧' },
  OTHER:   { color: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   icon: '⚙️' },
};

const DataTable = ({ rows, columns, label }) => {
  if (!rows?.length) return null;
  const cols = columns?.length ? columns : Object.keys(rows[0] || {});

  return (
    <div className="mt-3">
      {label && <p className="text-xs text-gray-500 mb-1.5">{label}</p>}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5">
              {cols.map(c => (
                <th key={c} className="text-left px-3 py-2 text-gray-500 font-mono whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-gray-300 font-mono whitespace-nowrap">
                    {row[c] === null || row[c] === undefined
                      ? <span className="text-gray-600 italic">null</span>
                      : String(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SimulationResult = ({ result }) => {
  if (!result) return null;
  const { simulation, note } = result;
  if (!simulation) return null;

  const style = TYPE_STYLES[simulation.simulationType] || TYPE_STYLES.OTHER;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Virtual badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit">
        <span className="text-purple-400 text-xs font-semibold">🧪 VIRTUAL SIMULATION</span>
        <span className="text-gray-500 text-xs">— Real DB untouched</span>
      </div>

      {/* Result header */}
      <div className={`rounded-xl p-4 ${style.bg} border ${style.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{style.icon}</span>
            <span className={`font-bold ${style.color}`}>{simulation.simulationType}</span>
            {simulation.affectedTable && (
              <span className="text-gray-400 text-sm">
                on <span className="font-mono text-white">{simulation.affectedTable}</span>
              </span>
            )}
          </div>
          {simulation.rowsAffected > 0 && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${style.bg} ${style.color} border ${style.border}`}>
              {simulation.rowsAffected} row{simulation.rowsAffected !== 1 ? 's' : ''} affected
            </span>
          )}
        </div>
        {simulation.message && (
          <p className="text-sm text-gray-300 mt-2">{simulation.message}</p>
        )}
      </div>

      {/* Result rows for SELECT */}
      {simulation.simulationType === 'SELECT' && simulation.resultRows?.length > 0 && (
        <div className="card">
          <p className="text-sm font-medium text-white mb-1 flex items-center gap-2">
            <FiCheck className="text-blue-400" /> Query Result ({simulation.resultRows.length} rows)
          </p>
          <DataTable rows={simulation.resultRows} columns={simulation.columns} />
        </div>
      )}

      {/* Before / After for UPDATE / DELETE / INSERT */}
      {['UPDATE', 'DELETE', 'INSERT'].includes(simulation.simulationType) && (
        <div className="card space-y-3">
          <p className="text-sm font-medium text-white flex items-center gap-2">
            <FiInfo className="text-amber-400" /> Data Change Preview
          </p>

          {simulation.simulationType === 'UPDATE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DataTable rows={simulation.beforeSnapshot} columns={simulation.columns} label="⬅️ Before" />
              </div>
              <div className="flex flex-col">
                <div className="hidden md:flex items-center justify-center h-full">
                  <FiArrowRight className="text-amber-400" size={24} />
                </div>
                <DataTable rows={simulation.afterSnapshot} columns={simulation.columns} label="➡️ After (virtual)" />
              </div>
            </div>
          )}

          {simulation.simulationType === 'DELETE' && (
            <DataTable rows={simulation.beforeSnapshot} columns={simulation.columns} label="🗑️ Rows that would be removed (virtual only)" />
          )}

          {simulation.simulationType === 'INSERT' && (
            <DataTable rows={simulation.resultRows} columns={simulation.columns} label="➕ Row that would be inserted (virtual only)" />
          )}
        </div>
      )}

      {/* Safety note */}
      {note && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <FiAlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
          <p className="text-xs text-amber-400/80">{note}</p>
        </div>
      )}
    </motion.div>
  );
};

export default SimulationResult;
