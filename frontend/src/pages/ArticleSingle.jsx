// frontend/src/pages/ArticleSingle.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';
import '../styles/articles.css';

const ArticleSingle = () => {
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const categories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting', 'Saved'];

  const fromPage = location.state?.fromPage;
  const fromCategory = location.state?.fromCategory;

  const handleCategoryChange = (category) => {
    if (category === 'Saved') {
      navigate('/articles', { state: { filter: 'Saved' } });
    } else {
      navigate(`/articles/category/${category}`, { state: { category } });
    }
  };

  useEffect(() => {
    if (location.state?.article) {
      const stateArticle = location.state.article;
      
      // Check if we have full article data (has content) or just preview data
      if (stateArticle.content) {
        // Full article data available, use it
        setArticle(stateArticle);
        setLoading(false);
        fetchRelatedArticles(stateArticle._id);
        checkIfSaved(stateArticle._id);
      } else {
        // Only preview data (from related articles), fetch full data
        console.log('Preview data only, fetching full article...');
        fetchArticle(stateArticle._id);
      }
    } else if (id) {
      fetchArticle(id);
    } else {
      navigate('/articles');
    }
  }, [id, location.state, navigate]);

  const fetchArticle = async (articleId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/${articleId}`
      );
      
      if (response.data.success) {
        setArticle(response.data.data);
        fetchRelatedArticles(articleId);
        checkIfSaved(articleId);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (articleId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/${articleId}/related`
      );
      
      if (response.data.success) {
        setRelatedArticles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const checkIfSaved = async (articleId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/${articleId}/is-saved`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setIsSaved(response.data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showNotification('Please login to save articles', 'info');
        return;
      }

      if (isSaved) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/articles/${article._id}/save`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsSaved(false);
        showNotification('Article removed from saved!', 'info');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/articles/${article._id}/save`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsSaved(true);
        showNotification('Article saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      showNotification('Failed to save article', 'error');
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      info: 'bg-blue-500',
      error: 'bg-red-500'
    };
    
    notification.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg fixed top-5 right-5 z-[100]`;
    notification.textContent = message;
    notification.style.animation = 'slideIn 0.3s ease-in-out';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const viewArticle = (selectedArticle) => {
    // Pass complete article data with category context
    navigate(`/articles/${selectedArticle._id}`, { 
      state: { 
        article: selectedArticle,
        fromCategory: article?.category // Use current article's category
      } 
    });
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    if (fromPage === 'saved') {
      navigate('/articles', { state: { filter: 'Saved' } });
    } else if (fromCategory) {
      navigate(`/articles/category/${fromCategory}`, { 
        state: { category: fromCategory },
        replace: false
      });
    } else if (article && article.category) {
      navigate(`/articles/category/${article.category}`, { 
        state: { category: article.category },
        replace: false
      });
    } else {
      navigate(-1);
    }
  };

  const getCurrentFilter = () => {
    if (fromPage === 'saved') return 'Saved';
    if (fromCategory) return fromCategory;
    return article?.category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader 
          categories={categories}
          currentFilter={getCurrentFilter()}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader 
          categories={categories}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">Article not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleHeader 
        categories={categories}
        currentFilter={getCurrentFilter()}
        onFilterChange={handleCategoryChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="flex gap-6 items-start">
          {/* Go Back Button - Hidden on mobile, positioned to the left */}
          <button
            onClick={handleGoBack}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-sm flex-1">
            <div className="p-6 sm:p-8">
              {/* Category and Saved Status */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-sm text-gray-600 font-semibold uppercase">{article.category}</p>
                {isSaved && <p className="text-sm text-amber-600 font-semibold uppercase">Saved</p>}
              </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {article.link ? (
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
                        {article.title}
                      </a>
                    ) : (
                      article.title
                    )}
                  </h1>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {article.description}
                  </p>
                </div>
                <button 
                  className={`flex-shrink-0 bookmark-btn transition-all duration-300 mt-2 ${isSaved ? 'saved' : ''}`}
                  onClick={toggleSave}
                  title={isSaved ? 'Remove from saved' : 'Save article'}
                >
                  <svg 
                    className="w-8 h-8" 
                    fill={isSaved ? '#F59E0B' : 'none'}
                    stroke={isSaved ? '#F59E0B' : 'currentColor'} 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>By: {article.author || 'Staff Writer'}</span>
                <span>•</span>
                <span>{new Date(article.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                {article.viewCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{article.viewCount} views</span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-8">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>

            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {article.image1 && (
              <div className="mt-8">
                <img 
                  src={article.image1} 
                  alt="Article illustration" 
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </article>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <div 
                  key={relatedArticle._id}
                  className="saved-article-card-wireframe fade-in cursor-pointer"
                  onClick={() => viewArticle(relatedArticle)}
                >
                  <img 
                    src={relatedArticle.image} 
                    alt={relatedArticle.title} 
                    loading="lazy"
                  />
                  <div className="saved-article-card-content">
                    <p className="text-xs text-gray-600 font-medium uppercase mb-1">
                      {relatedArticle.category}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {relatedArticle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ArticleSingle;