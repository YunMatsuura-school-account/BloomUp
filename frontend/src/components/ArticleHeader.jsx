// frontend/src/components/ArticleHeader.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ArticleSearchModal from './articleSearchModal';

const ArticleHeader = ({ categories, currentFilter, onFilterChange }) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category) => {
    // Special handling for "Saved" category - stay on home page
    if (category === 'Saved') {
      if (location.pathname === '/articles') {
        // On articles home page, just update filter to show saved
        if (onFilterChange) {
          onFilterChange(category);
        }
      } else {
        // From other pages, go to articles home and show saved
        navigate('/articles', { state: { filter: 'Saved' } });
      }
    } else {
      // For all other categories, navigate to category view
      navigate('/articles/category', { state: { category } });
    }
  };

  const goHome = () => {
    navigate('/articles');
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition" 
                onClick={goHome}
              >
                Articles & Resources
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                {categories.filter(cat => cat !== 'Saved').map((category) => (
                  <button
                    key={category}
                    className={`nav-btn ${
                      currentFilter === category ? 'active' : ''
                    } text-gray-600 hover:text-gray-900 font-medium transition-all duration-300`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                ))}
                <button
                  key="Saved"
                  className={`nav-btn ${
                    currentFilter === 'Saved' ? 'active' : ''
                  } text-gray-600 hover:text-gray-900 font-medium transition-all duration-300`}
                  onClick={() => handleCategoryClick('Saved')}
                >
                  Saved
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-600 hover:text-gray-900 transition"
                onClick={() => setSearchModalOpen(true)}
                title="Search articles"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <ArticleSearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </>
  );
};

export default ArticleHeader;