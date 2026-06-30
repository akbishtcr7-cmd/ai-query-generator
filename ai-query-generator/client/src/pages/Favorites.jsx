import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiFolder, FiDatabase } from 'react-icons/fi';
import { queryService } from '../services/queryService';
import Loader from '../components/common/Loader';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionFilter, setCollectionFilter] = useState('');
  const [collections, setCollections] = useState(['Default']);

  useEffect(() => { fetchFavorites(); }, [collectionFilter]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await queryService.getFavorites({ collection: collectionFilter || undefined });
      setFavorites(data.data);
      const cols = [...new Set(data.data.map(f => f.collection))];
      if (cols.length) setCollections(['', ...cols]);
    } catch {} finally { setLoading(false); }
  };

  const handleRemove = async (item) => {
    try {
      await queryService.removeFavorite(item.queryHistory._id);
      setFavorites(f => f.filter(i => i._id !== item._id));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiHeart className="text-red-400" /> Favorites
        </h1>
        <p className="text-gray-500 text-sm mt-1">{favorites.length} saved queries</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', ...collections.filter(Boolean)].map(col => (
          <button key={col || 'all'} onClick={() => setCollectionFilter(col)}
            className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${
              collectionFilter === col
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'glass text-gray-400 hover:text-white border border-white/10'
            }`}>
            <FiFolder size={12} /> {col || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader /></div>
      ) : favorites.length === 0 ? (
        <div className="card text-center py-16">
          <FiHeart className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-500">No favorites yet. Save queries from history!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav, i) => (
            <motion.div key={fav._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} className="card hover:border-red-500/30 transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDatabase size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{fav.queryHistory?.databaseType}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {fav.collection}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{fav.queryHistory?.prompt}</p>
                  <pre className="text-xs text-green-300/70 truncate font-mono bg-black/20 px-3 py-2 rounded-lg">
                    {fav.queryHistory?.generatedQuery?.substring(0, 80)}...
                  </pre>
                  {fav.notes && <p className="text-xs text-gray-600 mt-2 italic">"{fav.notes}"</p>}
                  <p className="text-xs text-gray-600 mt-2">{new Date(fav.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleRemove(fav)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
