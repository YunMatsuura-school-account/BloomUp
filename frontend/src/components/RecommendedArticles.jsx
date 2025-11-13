import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecommendedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const token = localStorage.getItem("accessToken");
        
        // Try to fetch recommended articles (requires authentication)
        if (token) {
          try {
            const resp = await fetch(`${base}/api/articles/recommended`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (resp.ok) {
              const json = await resp.json();
              if (json.success && json.data && json.data.length > 0) {
                setArticles(json.data);
                return;
              }
            }
          } catch (e) {
            console.error("Error fetching recommended articles:", e);
            // Fall through to default fetch
          }
        }
        
        // Fallback: fetch regular articles if recommended fails or no token
        const resp = await fetch(`${base}/api/articles?limit=4&page=1`);
        let json = {};
        try {
          json = await resp.json();
        } catch {}
        if (!resp.ok)
          throw new Error(json?.message || "Failed to load articles");
        setArticles(json.data || []);
      } catch (e) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const rows = useMemo(() => {
    const list = (articles || []).slice(0, 4).map((a) => ({
      id: a._id || a.id,
      title: a.title,
      description: a.description,
      imageUrl: a.image || a.image1 || null,
      emoji: "📰",
      link: a.link || null,
    }));
    return [list.slice(0, 2), list.slice(2, 4)];
  }, [articles]);

  const navigate = useNavigate();

  const ArticleCard = ({ article }) => (
    <div
      className="bg-white rounded-xl p-5 flex gap-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => article.id && navigate(`/articles/${article.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          article.id && navigate(`/articles/${article.id}`);
        }
      }}
    >
      <div className="w-[150px] h-[140px] bg-[#AEAEAE] rounded-xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{article.emoji}</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className="text-base font-semibold text-black leading-6">
          {article.title}
        </h3>
        <p className="text-xs font-medium text-black leading-[14px] overflow-hidden line-clamp-4">
          {article.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h2 className="text-lg font-medium text-black w-full">
        Recommended Articles
      </h2>

      {loading && (
        <div className="bg-white rounded-xl p-5 w-full text-sm text-gray-600">
          Loading…
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            {rows[0].map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            {rows[1].map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}

      {!loading && rows[0].length + rows[1].length === 0 && (
        <div className="bg-white rounded-xl p-5 w-full text-sm text-gray-600">
          No articles found
        </div>
      )}
    </div>
  );
};

export default RecommendedArticles;
