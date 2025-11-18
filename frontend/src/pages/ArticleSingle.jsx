// frontend/src/pages/ArticleSingle.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleHeader from '../components/ArticleHeader';

const ArticleSingle = () => {
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousArticle, setPreviousArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
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
      
      if (stateArticle.content) {
        setArticle(stateArticle);
        setLoading(false);
        fetchRelatedArticles(stateArticle._id);
        checkIfSaved(stateArticle._id);
        fetchCategoryArticlesForNavigation(stateArticle);
      } else {
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
        fetchCategoryArticlesForNavigation(response.data.data);
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

  const fetchCategoryArticlesForNavigation = async (currentArticle) => {
    try {
      // Fetch all articles in the same category
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/articles/category/${currentArticle.category}`
      );
      
      if (response.data.success) {
        const categoryArticles = response.data.data;
        
        // Find current article index
        const currentIndex = categoryArticles.findIndex(
          art => art._id === currentArticle._id
        );
        
        if (currentIndex !== -1) {
          // Set previous article (if exists)
          if (currentIndex > 0) {
            setPreviousArticle(categoryArticles[currentIndex - 1]);
          } else {
            setPreviousArticle(null);
          }
          
          // Set next article (if exists)
          if (currentIndex < categoryArticles.length - 1) {
            setNextArticle(categoryArticles[currentIndex + 1]);
          } else {
            setNextArticle(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching category articles for navigation:', error);
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
    
    notification.className = `${colors[type]} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg fixed top-5 right-3 sm:right-5 z-[100] text-sm sm:text-base`;
    notification.textContent = message;
    notification.style.animation = 'slideIn 0.3s ease-in-out';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const viewArticle = (selectedArticle) => {
    navigate(`/articles/${selectedArticle._id}`, { 
      state: { 
        article: selectedArticle,
        fromCategory: article?.category
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

  const handlePreviousArticle = () => {
    if (previousArticle) {
      navigate(`/articles/${previousArticle._id}`, { 
        state: { 
          article: previousArticle,
          fromCategory: article?.category
        } 
      });
      window.scrollTo(0, 0);
    }
  };

  const handleNextArticle = () => {
    if (nextArticle) {
      navigate(`/articles/${nextArticle._id}`, { 
        state: { 
          article: nextArticle,
          fromCategory: article?.category
        } 
      });
      window.scrollTo(0, 0);
    }
  };

  const getCurrentFilter = () => {
    if (fromPage === 'saved') return 'Saved';
    if (fromCategory) return fromCategory;
    return article?.category;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories}
          currentFilter={getCurrentFilter()}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-base sm:text-lg">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
        <ArticleHeader 
          categories={categories}
          onFilterChange={handleCategoryChange}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-base sm:text-lg">Article not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
      <ArticleHeader 
        categories={categories}
        currentFilter={getCurrentFilter()}
        onFilterChange={handleCategoryChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Back Arrow - Positioned to the left of article */}
          <button
            onClick={handleGoBack}
            className="hidden lg:block flex-shrink-0 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            aria-label="Go back"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Mobile Back Button */}
          <button
            onClick={handleGoBack}
            className="lg:hidden inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* Main Article Content */}
          <article className="flex-1 rounded-lg overflow-hidden">
            <div className="px-6 pb-6 lg:px-8 lg:pb-8">
              {/* Category and Save Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {article.category}
                  </span>
                  {isSaved && (
                    <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                      <svg 
                        className="w-4 h-4" 
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      Saved
                    </span>
                  )}
                </div>
                <button 
                  className={`transition-all duration-300 ${isSaved ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                  onClick={toggleSave}
                  title={isSaved ? 'Remove from saved' : 'Save article'}
                >
                  <svg 
                    className="w-7 h-7" 
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={isSaved ? 0 : 2}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {article.link ? (
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
                    {article.title}
                  </a>
                ) : (
                  article.title
                )}
              </h1>

              {/* Description */}
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                {article.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <span>By: {article.author || 'Joe Casper for CNN news'}</span>
                <span>•</span>
                <span>Published: {new Date(article.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              {/* Main Image */}
              <div className="mb-6">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-auto rounded-lg object-cover"
                />
                {/* Image Caption */}
                <p className="text-xs text-gray-500 mt-2 italic">
                  Between 2010 and 2019, there were declines in at least one kind of vaccination in 21 of 36 "high-income countries" measured in a new study.
                </p>
              </div>

              {/* Article Content */}
              <div className="prose prose-base max-w-none">
                <div className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              {/* Additional Image */}
              {article.image1 && (
                <div className="mt-8">
                  <img 
                    src={article.image1} 
                    alt="Article illustration" 
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handlePreviousArticle}
                  disabled={!previousArticle}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[140px] ${
                    previousArticle 
                      ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  }`}
                >
                  Go Back
                </button>
                <button
                  onClick={handleNextArticle}
                  disabled={!nextArticle}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[140px] ${
                    nextArticle 
                      ? 'bg-teal-600 text-white hover:bg-teal-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Article
                </button>
              </div>
            </div>
          </article>

          {/* Related Articles Sidebar */}
          {relatedArticles.length > 0 && (
            <aside className="lg:w-80 xl:w-96">
              <div className="rounded-lg px-6 pb-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">You might also like</h2>
                <div className="space-y-4">
                  {relatedArticles.slice(0, 3).map((relatedArticle) => (
                    <div 
                      key={relatedArticle._id}
                      className="cursor-pointer group bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => viewArticle(relatedArticle)}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={relatedArticle.image} 
                          alt={relatedArticle.title} 
                          loading="lazy"
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90 transition-opacity"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {relatedArticle.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {relatedArticle.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArticleSingle;