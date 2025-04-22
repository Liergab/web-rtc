import React from 'react';

export const ResponsiveLayout: React.FC = () => {
  // Example content sections
  const sections = [
    {
      title: 'Responsive Design',
      content:
        'This layout showcases responsive design patterns using Tailwind CSS utility classes. Notice how the layout changes based on screen size.',
    },
    {
      title: 'Mobile First',
      content:
        'We start with a mobile design and progressively enhance the experience for larger screens. This approach ensures a good experience on all devices.',
    },
    {
      title: 'Flexible Grid',
      content:
        'The grid system adapts based on available space, changing from a single column on mobile to multiple columns on larger screens.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-vulcan-50)]">
      {/* Header - Full width, color changes on breakpoints */}
      <header className="bg-[var(--color-vulcan-700)] sm:bg-[var(--color-vulcan-600)] md:bg-[var(--color-vulcan-500)] text-white">
        <div className="container-custom py-4">
          <div className="stack-to-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl font-bold">Responsive Layout Demo</h1>
              <p className="text-sm text-white/80 show-only-on-mobile">Mobile View</p>
              <p className="text-sm text-white/80 show-only-on-tablet">Tablet View</p>
              <p className="text-sm text-white/80 show-only-on-desktop">Desktop View</p>
            </div>

            {/* Navigation - Changes from dropdown on mobile to horizontal on larger screens */}
            <nav className="w-full sm:w-auto">
              <ul className="stack-to-row space-y-2 sm:space-y-0 sm:space-x-6">
                <li>
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    About
                  </a>
                </li>
                <li className="hide-on-mobile">
                  <a href="#" className="hover:underline">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="container-custom py-8">
        {/* Hero section - Text alignment changes on breakpoints */}
        <section className="mb-12">
          <div className="card-with-padding">
            <div className="stack-to-row items-center">
              <div className="half-on-tablet mb-6 sm:mb-0">
                <h2 className="text-center-left-on-tablet heading-1 mb-4">
                  Responsive Layout Examples
                </h2>
                <p className="text-center-left-on-tablet paragraph mb-6">
                  This page demonstrates various responsive design patterns implemented with
                  Tailwind CSS utility classes.
                </p>
                <div className="flex-center sm:flex-start">
                  <button className="btn-primary mr-4">Get Started</button>
                  <button className="btn-outline hide-on-mobile">Learn More</button>
                </div>
              </div>

              <div className="half-on-tablet">
                <img
                  src="https://via.placeholder.com/600x400/A8B4FC/FFFFFF?text=Responsive+Design"
                  alt="Responsive Design"
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content grid - Changes columns based on screen size */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6">Flexible Content Grid</h2>
          <div className="grid-cols-3 responsive-gap">
            {sections.map((section, index) => (
              <div key={index} className="card-with-padding">
                <h3 className="heading-3 mb-2">{section.title}</h3>
                <p className="paragraph">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature section with spacing that changes on breakpoints */}
        <section className="responsive-padding bg-[var(--color-vulcan-200)] rounded-lg">
          <h2 className="heading-2 mb-6">Responsive Spacing</h2>
          <p className="paragraph mb-4">
            Notice how the padding and margins adjust based on screen size. This section uses
            responsive padding that increases on larger screens.
          </p>
          <div className="text-center-left-on-tablet">
            <button className="btn-primary">Learn More</button>
          </div>
        </section>
      </main>

      {/* Footer with responsive columns */}
      <footer className="bg-[var(--color-vulcan-800)] text-white py-8">
        <div className="container-custom">
          <div className="grid-cols-2 responsive-gap">
            <div>
              <h3 className="text-lg font-bold mb-4">About Us</h3>
              <p className="text-[var(--color-vulcan-300)] mb-4">
                This demo showcases responsive layout techniques using Tailwind CSS utility classes
                and custom responsive utilities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-[var(--color-vulcan-300)] hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[var(--color-vulcan-300)] hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[var(--color-vulcan-300)] hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[var(--color-vulcan-300)] hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--color-vulcan-700)] mt-8 pt-8 text-center text-[var(--color-vulcan-400)] text-sm">
            <p>© 2023 Responsive Layout Demo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
