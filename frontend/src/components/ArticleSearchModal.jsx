// frontend/src/components/ArticleSearchModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArticleSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles?search=${encodeURIComponent(searchQuery)}&limit=10`
      );
      
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/articles/${article._id}`, { state: { article } });
    onClose();
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'searchModal') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="searchModal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={handleModalClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl mx-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="absolute top-6 right-6 text-black hover:text-gray-600 transition-colors z-10"
          onClick={onClose}
          aria-label="Close search"
        >
          <svg 
            className="w-7 h-7" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Search Input Section */}
        <div className="px-8 pt-16 pb-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tell us what are you looking for?" 
              className="w-full border-b-2 border-black text-gray-500 placeholder-gray-400 text-base py-3 pr-12 focus:outline-none focus:border-black transition-colors"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {/* Search Icon - Right Side */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <svg 
                className="w-6 h-6 text-black" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-h-96 overflow-y-auto px-8 pb-8">
          {loading && (
            <p className="text-gray-500 text-center py-8">Searching...</p>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <p className="text-gray-500 text-center py-8">No articles found</p>
          )}
          {!loading && results.map((article) => (
            <div 
              key={article._id}
              className="py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors -mx-8 px-8 last:border-b-0"
              onClick={() => handleArticleClick(article)}
            >
              <h4 className="font-semibold text-gray-900 mb-1">{article.title}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.description}</p>
              <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                {article.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleSearchModal;