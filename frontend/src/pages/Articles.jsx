// frontend/src/pages/Articles.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting', 'Saved'];

  useEffect(() => {
    // Check if navigated here with a filter state
    if (location.state?.filter) {
      setCurrentFilter(location.state.filter);
    } else {
      // Default to 'All' when visiting /articles directly
      setCurrentFilter('All');
    }
  }, [location.state]);

  useEffect(() => {
    const loadData = async () => {
      await fetchArticles();
      if (currentFilter === 'Saved') {
        await fetchSavedArticles();
      }
    };
    loadData();
  }, [currentFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = currentFilter === 'All' || currentFilter === 'Saved' 
        ? '' 
        : `?category=${currentFilter}`;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles${query}`
      );
      
      if (response.data.success) {
        setArticles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedArticles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setSavedArticles([]);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/saved/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSavedArticles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
      setSavedArticles([]);
    }
  };

  const viewArticle = (article, fromSaved = false) => {
    navigate(`/articles/${article._id}`, { 
      state: { 
        article,
        fromPage: fromSaved ? 'saved' : null
      } 
    });
  };

  const getFilteredArticles = () => {
    if (currentFilter === 'Saved') {
      return savedArticles;
    }
    return articles;
  };

  const filteredArticles = getFilteredArticles();
  const featuredArticle = filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  const remainingArticles = filteredArticles.filter(a => a._id !== featuredArticle?._id);
  const topArticles = remainingArticles.slice(0, 2);
  const alsoLikeArticles = remainingArticles.slice(2, 7);
  const savedArticlesList = savedArticles.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-base sm:text-lg">Loading articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
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
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Saved Tab Content - Using ArticleCategory Layout */}
        {currentFilter === 'Saved' ? (
          <div className="py-2 sm:py-4">
            {/* Category Header */}
            {savedArticles.length > 0 && (
              <div className="mb-8 sm:mb-12 -mx-3 sm:-mx-4 lg:-mx-8">
                <div 
                  className="relative h-48 sm:h-64 lg:h-80 bg-cover bg-center"
                  style={{ backgroundImage: `url('${savedArticles[0].image}')` }}
                >
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center px-4">
                      Saved
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Container */}
            <section>
              <div className="flex flex-col gap-4 sm:gap-6">
                {!localStorage.getItem('accessToken') ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-base sm:text-lg">Please login to view saved articles</p>
                  </div>
                ) : savedArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-base sm:text-lg">No articles saved yet</p>
                  </div>
                ) : (
                  savedArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row"
                      onClick={() => viewArticle(article, true)}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        loading="lazy"
                        className="w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-40 md:h-44 lg:h-48 object-cover"
                      />
                      <div className="flex-1 p-4 sm:p-5 lg:p-6">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase mb-2">{article.category}</p>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-sm sm:text-base text-gray-700 line-clamp-2 sm:line-clamp-3">{article.description}</p>
                        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                          <span className="text-xs text-gray-500">By: {article.author || 'Staff'}</span>
                          {article.viewCount > 0 && (
                            <span className="text-xs text-gray-500">{article.viewCount} views</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          /* Regular Content (when not on Saved tab) */
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-6 sm:mb-8">
                <div 
                  className="overflow-hidden cursor-pointer"
                  onClick={() => viewArticle(featuredArticle)}
                >
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title} 
                    loading="lazy"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-t-lg"
                  />
                  <div className="pr-4 py-4 sm:pr-5 sm:py-5 lg:pr-6 lg:py-6 border-b border-black">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase mb-2">{featuredArticle.category}</p>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 leading-tight">{featuredArticle.title}</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-2 sm:line-clamp-3">{featuredArticle.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Articles & You Might Also Like */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Top Articles */}
              <section className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Top articles</h2>
                <div className="flex flex-col gap-4 sm:gap-6 flex-1">
                  {topArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => viewArticle(article)}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        loading="lazy"
                        className="w-full h-44 sm:h-52 lg:h-56 object-cover"
                      />
                      <div className="pr-4 py-4 sm:pr-5 sm:py-5 lg:pr-6 lg:py-6">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase mb-1">{article.category}</p>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {article.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* You Might Also Like */}
              <section className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">You might also like</h2>
                <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                  {alsoLikeArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden p-3 sm:p-4 flex gap-3 sm:gap-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => viewArticle(article)}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        loading="lazy"
                        className="w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 sm:mb-2 leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {article.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Saved Section Preview */}
            {savedArticlesList.length > 0 && (
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Saved</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {savedArticlesList.map((article) => (
                    <div 
                      key={article._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => viewArticle(article, true)}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        loading="lazy"
                        className="w-full h-40 sm:h-44 lg:h-48 object-cover"
                      />
                      <div className="p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase mb-1">{article.category}</p>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Articles;