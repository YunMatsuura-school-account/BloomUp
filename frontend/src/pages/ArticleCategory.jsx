// frontend/src/pages/ArticleCategory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';

const ArticleCategory = () => {
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();

  const categories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting', 'Saved'];
  const ARTICLES_PER_PAGE = 5;

  useEffect(() => {
    console.log('📍 URL category changed:', category);
    if (category) {
      setCurrentCategory(category);
    }
  }, [category]);

  useEffect(() => {
    if (currentCategory) {
      console.log('🔄 Current category changed, fetching articles for:', currentCategory);
      fetchArticles();
    }
  }, [currentCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Fetching articles for category:', currentCategory);
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/category/${currentCategory}`
      );
      
      console.log('📦 Response received:', response.data);
      
      if (response.data.success) {
        const filteredArticles = response.data.data.filter(
          article => article.category === currentCategory
        );
        
        console.log('✅ Filtered articles:', filteredArticles.length);
        
        setArticles(filteredArticles);
        setDisplayedArticles(filteredArticles.slice(0, ARTICLES_PER_PAGE));
        setHasMore(filteredArticles.length > ARTICLES_PER_PAGE);
        setPage(1);
      } else {
        console.log('❌ No articles in response');
        setArticles([]);
        setDisplayedArticles([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      setError('Failed to load articles');
      setArticles([]);
      setDisplayedArticles([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = 0;
      const endIndex = nextPage * ARTICLES_PER_PAGE;
      
      const newDisplayedArticles = articles.slice(startIndex, endIndex);
      setDisplayedArticles(newDisplayedArticles);
      setPage(nextPage);
      setHasMore(endIndex < articles.length);
      setLoadingMore(false);
    }, 300);
  };

  const handleCategoryChange = (newCategory) => {
    console.log('🔀 Category change requested:', newCategory);
    if (newCategory === 'Saved') {
      navigate('/articles', { state: { filter: 'Saved' } });
    } else if (newCategory === 'All') {
      navigate('/articles', { state: { filter: 'All' } });
    } else {
      navigate(`/articles/category/${newCategory}`);
    }
  };

  const viewArticle = (article) => {
    navigate(`/articles/${article._id}`, { 
      state: { 
        article,
        fromCategory: currentCategory 
      } 
    });
  };

  const randomArticle = articles.length > 0 
    ? articles[Math.floor(Math.random() * articles.length)]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentCategory}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-base sm:text-lg">Loading {currentCategory} articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentCategory}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600 text-base sm:text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
      <ArticleHeader 
        categories={categories} 
        currentFilter={currentCategory}
        onFilterChange={handleCategoryChange}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-4 sm:pb-8 lg:pb-12">
        {/* Category Header */}
        {randomArticle ? (
          <div className="mb-8 sm:mb-12 -mx-3 sm:-mx-4 lg:-mx-8">
            <div 
              className="relative h-48 sm:h-64 lg:h-80 bg-cover bg-center"
              style={{ backgroundImage: `url('${randomArticle.image}')` }}
            >
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center px-4">
                  {currentCategory}
                </h2>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 sm:mb-12 -mx-3 sm:-mx-4 lg:-mx-8">
            <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center px-4">
                {currentCategory}
              </h2>
            </div>
          </div>
        )}

        {/* Articles Container */}
        <section>
          <div className="flex flex-col gap-4 sm:gap-6">
            {displayedArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-base sm:text-lg mb-2">
                  No articles found in {currentCategory}
                </p>
                <p className="text-gray-400 text-sm">
                  Check back later for new content in this category
                </p>
              </div>
            ) : (
              <>
                {displayedArticles.map((article) => (
                  <div 
                    key={article._id}
                    className="rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row"
                    style={{ backgroundColor: '#EFEFEF' }}
                    onClick={() => viewArticle(article)}
                  >
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      loading="lazy"
                      className="w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-40 md:h-44 lg:h-48 object-cover"
                    />
                    <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm sm:text-base text-gray-700 line-clamp-2 sm:line-clamp-3 mb-auto">{article.description}</p>
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">By: {article.author || 'Staff'}</span>
                        {article.viewCount > 0 && (
                          <span className="text-xs text-gray-500">{article.viewCount} views</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] sm:min-w-[200px] text-sm sm:text-base"
                    >
                      {loadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg 
                            className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-gray-600" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ArticleCategory;