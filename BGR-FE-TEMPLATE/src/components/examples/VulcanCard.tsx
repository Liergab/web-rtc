import React from 'react';

interface VulcanCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  className?: string;
  variant?: 'light' | 'dark';
}

export const VulcanCard: React.FC<VulcanCardProps> = ({
  title,
  description,
  imageUrl,
  tags = [],
  className = '',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`${isDark ? 'card-dark' : 'card'} card-hover transition-all duration-300 max-w-md mx-auto sm:max-w-lg lg:max-w-xl ${className}`}
    >
      {/* Card layout changes from vertical to horizontal on tablet */}
      <div className="stack-to-row overflow-hidden">
        {/* Image container - full width on mobile, half width on tablet */}
        <div className="half-on-tablet relative">
          <img src={imageUrl} alt={title} className="w-full h-48 sm:h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vulcan-950)] to-transparent opacity-30"></div>
        </div>

        {/* Content container - full width on mobile, half width on tablet */}
        <div className="half-on-tablet responsive-padding">
          {/* Title aligns center on mobile, left on tablet+ */}
          <h3
            className={`text-center-left-on-tablet text-lg md:text-xl font-bold mb-2 ${isDark ? 'text-[var(--color-vulcan-50)]' : 'text-[var(--color-vulcan-900)]'}`}
          >
            {title}
          </h3>

          <p
            className={`mb-4 ${isDark ? 'text-[var(--color-vulcan-100)]' : 'text-[var(--color-vulcan-600)]'}`}
          >
            {description}
          </p>

          {/* Tags - horizontal scrolling on mobile, wrapping on desktop */}
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible -mx-1 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-block ${
                  isDark
                    ? 'bg-[var(--color-vulcan-700)] text-[var(--color-vulcan-100)]'
                    : 'bg-[var(--color-vulcan-100)] text-[var(--color-vulcan-700)]'
                } text-xs px-2 py-1 rounded-full m-1 whitespace-nowrap`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Button container - stack on mobile, side by side on tablet+ */}
          <div className="stack-to-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="btn-primary">View Details</button>

            {/* Secondary button hidden on mobile */}
            <button className="btn-outline hide-on-mobile">Save for Later</button>

            {/* Icon button shown only on mobile */}
            <button
              className={`show-only-on-mobile p-2 rounded-full ${
                isDark ? 'bg-[var(--color-vulcan-700)]' : 'bg-[var(--color-vulcan-100)]'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? 'var(--color-vulcan-200)' : 'var(--color-vulcan-600)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
