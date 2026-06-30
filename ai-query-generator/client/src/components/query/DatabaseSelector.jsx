import { FiDatabase } from 'react-icons/fi';

const databases = [
  { value: 'MySQL', label: 'MySQL', color: 'from-orange-500 to-orange-600' },
  { value: 'PostgreSQL', label: 'PostgreSQL', color: 'from-blue-500 to-blue-600' },
  { value: 'MongoDB', label: 'MongoDB', color: 'from-green-500 to-green-600' },
  { value: 'SQLite', label: 'SQLite', color: 'from-sky-500 to-sky-600' },
  { value: 'Oracle SQL', label: 'Oracle SQL', color: 'from-red-500 to-red-600' },
  { value: 'SQL Server', label: 'SQL Server', color: 'from-purple-500 to-purple-600' },
];

const DatabaseSelector = ({ value, onChange }) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
      <FiDatabase size={14} /> Database Type
    </label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {databases.map(db => (
        <button
          key={db.value}
          onClick={() => onChange(db.value)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
            value === db.value
              ? `bg-gradient-to-r ${db.color} text-white border-transparent shadow-lg scale-105`
              : 'glass text-gray-400 hover:text-white hover:border-purple-500/40 border-white/10'
          }`}
        >
          {db.label}
        </button>
      ))}
    </div>
  </div>
);

export default DatabaseSelector;
