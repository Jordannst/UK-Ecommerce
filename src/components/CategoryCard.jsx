import { Link } from 'react-router-dom';

const CategoryCard = ({ category, productCount = 0 }) => {
  return (
    <Link to={`/shop?category=${category.name}`}>
      <div className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-unklab-light rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200">
            {category.icon || '📦'}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-unklab-blue transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            {productCount > 0 && (
              <p className="text-xs text-gray-400 mt-2">{productCount} products</p>
            )}
          </div>

          {/* Arrow */}
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-unklab-blue group-hover:translate-x-1 transition-all duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;


