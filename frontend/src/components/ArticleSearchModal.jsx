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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleModalClick}
    >
      <div 
        className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
          onClick={onClose}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <p className="text-2xl font-semibold text-gray-700 mb-4">
            What are you looking for?
          </p>
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full border-b-2 border-gray-300 focus:border-teal-500 focus:outline-none text-lg py-2"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <p className="text-gray-500 text-center py-4">Searching...</p>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <p className="text-gray-500 text-center py-4">No articles found</p>
          )}
          {!loading && results.map((article) => (
            <div 
              key={article._id}
              className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleArticleClick(article)}
            >
              <h4 className="font-semibold text-gray-900">{article.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{article.description}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
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