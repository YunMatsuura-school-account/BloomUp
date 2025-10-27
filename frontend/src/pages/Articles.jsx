// frontend/src/pages/Articles.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';
import '../styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('Health');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting', 'Saved'];

  useEffect(() => {
    // Check if navigated here with a filter state
    if (location.state?.filter) {
      setCurrentFilter(location.state.filter);
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

  const viewArticle = (article) => {
    navigate(`/articles/${article._id}`, { state: { article } });
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
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">Loading articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleHeader 
        categories={categories} 
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saved Tab Content - Using ArticleCategory Layout */}
        {currentFilter === 'Saved' ? (
          <div className="py-4">
            {/* Category Header */}
            {savedArticles.length > 0 && (
              <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
                <div 
                  className="relative h-64 sm:h-80 bg-cover bg-center"
                  style={{ backgroundImage: `url('${savedArticles[0].image}')` }}
                >
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white text-center">
                      Saved
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Container */}
            <section>
              <div className="flex flex-col gap-6">
                {!localStorage.getItem('accessToken') ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Please login to view saved articles</p>
                  </div>
                ) : savedArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No articles saved yet</p>
                  </div>
                ) : (
                  savedArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="horizontal-card fade-in cursor-pointer"
                      onClick={() => viewArticle(article)}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        loading="lazy"
                      />
                      <div className="horizontal-card-content flex-1 p-6">
                        <p className="card-category">{article.category}</p>
                        <h3 className="card-title mb-2">{article.title}</h3>
                        <p className="card-description">{article.description}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
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
              <div className="mb-8">
                <div className="featured-card-wireframe fade-in" onClick={() => viewArticle(featuredArticle)}>
                  <img src={featuredArticle.image} alt={featuredArticle.title} loading="lazy" />
                  <div className="featured-card-content-wireframe">
                    <p className="text-xs text-gray-600 font-medium uppercase mb-2">{featuredArticle.category}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{featuredArticle.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{featuredArticle.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Articles & You Might Also Like */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Articles */}
              <section className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Top articles</h2>
                <div className="flex flex-col gap-6 flex-1">
                  {topArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="top-article-card-wireframe fade-in cursor-pointer"
                      onClick={() => viewArticle(article)}
                    >
                      <img src={article.image} alt={article.title} loading="lazy" />
                      <div className="top-article-card-content">
                        <p className="text-xs text-gray-600 font-medium uppercase mb-1">{article.category}</p>
                        <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                          {article.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* You Might Also Like */}
              <section className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
                <div className="flex flex-col flex-1" style={{ gap: '1.45rem' }}>
                  {alsoLikeArticles.map((article) => (
                    <div 
                      key={article._id}
                      className="horizontal-card-small-wireframe fade-in"
                      onClick={() => viewArticle(article)}
                    >
                      <img src={article.image} alt={article.title} loading="lazy" />
                      <div className="horizontal-card-small-content">
                        <h4 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
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
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedArticlesList.map((article) => (
                    <div 
                      key={article._id}
                      className="saved-article-card-wireframe fade-in cursor-pointer"
                      onClick={() => viewArticle(article)}
                    >
                      <img src={article.image} alt={article.title} loading="lazy" />
                      <div className="saved-article-card-content">
                        <p className="text-xs text-gray-600 font-medium uppercase mb-1">{article.category}</p>
                        <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
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