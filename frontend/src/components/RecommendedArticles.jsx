import React from "react";

const RecommendedArticles = () => {
  // Dummy articles data
  const articles = [
    {
      id: 1,
      title:
        "Article's title Article's title Article's title Article's title ....",
      description:
        "Details of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of ArtiDetails of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of Arti .......",
      image: "🏥",
    },
    {
      id: 2,
      title:
        "Article's title Article's title Article's title Article's title ....",
      description:
        "Details of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of ArtiDetails of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of Arti .......",
      image: "📚",
    },
    {
      id: 3,
      title:
        "Article's title Article's title Article's title Article's title ....",
      description:
        "Details of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of ArtiDetails of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of Arti .......",
      image: "🩺",
    },
    {
      id: 4,
      title:
        "Article's title Article's title Article's title Article's title ....",
      description:
        "Details of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of ArtiDetails of events Details of events Details of events Details of events Details of Articles Details of Articles Details of Articles Details of Arti .......",
      image: "🧬",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h2 className="text-lg font-medium text-white w-full">
        Recommended Articles
      </h2>

      {/* Articles Grid */}
      <div className="space-y-3 w-full">
        {articles.slice(0, 2).map((article) => (
          <div key={article.id} className="bg-white rounded-xl p-4 flex gap-4">
            {/* Article Image/Icon */}
            <div className="w-[120px] h-[110px] bg-[#AEAEAE] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
              {article.image}
            </div>

            {/* Article Content */}
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-sm font-semibold text-black leading-5">
                {article.title}
              </h3>
              <p className="text-xs font-medium text-black leading-[14px] h-[80px] overflow-hidden">
                {article.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row */}
      <div className="space-y-3 w-full">
        {articles.slice(2, 4).map((article) => (
          <div key={article.id} className="bg-white rounded-xl p-4 flex gap-4">
            {/* Article Image/Icon */}
            <div className="w-[120px] h-[110px] bg-[#AEAEAE] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
              {article.image}
            </div>

            {/* Article Content */}
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-sm font-semibold text-black leading-5">
                {article.title}
              </h3>
              <p className="text-xs font-medium text-black leading-[14px] h-[80px] overflow-hidden">
                {article.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedArticles;
