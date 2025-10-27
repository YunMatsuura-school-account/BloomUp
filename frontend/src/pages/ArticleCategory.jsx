// frontend/src/pages/ArticleCategory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';
import '../styles/articles.css';

const ArticleCategory = () => {
  const [articles, setArticles] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('Health');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting', 'Saved'];

  useEffect(() => {
    // Get category from navigation state or default to Health
    if (location.state?.category) {
      setCurrentCategory(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    fetchArticles();
  }, [currentCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/category/${currentCategory}`
      );
      
      if (response.data.success) {
        setArticles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewArticle = (article) => {
    navigate(`/articles/${article._id}`, { state: { article } });
  };

  const randomArticle = articles.length > 0 
    ? articles[Math.floor(Math.random() * articles.length)]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader 
          categories={categories} 
          currentFilter={currentCategory}
          onFilterChange={setCurrentCategory}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">Loading articles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleHeader 
        categories={categories} 
        currentFilter={currentCategory}
        onFilterChange={setCurrentCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        {randomArticle && (
          <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
            <div 
              className="relative h-64 sm:h-80 bg-cover bg-center"
              style={{ backgroundImage: `url('${randomArticle.image}')` }}
            >
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-white text-center">
                  {currentCategory}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* Articles Container */}
        <section>
          <div className="flex flex-col gap-6">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No articles found in {currentCategory}
                </p>
              </div>
            ) : (
              articles.map((article) => (
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
      </main>
    </div>
  );
};

export default ArticleCategory;