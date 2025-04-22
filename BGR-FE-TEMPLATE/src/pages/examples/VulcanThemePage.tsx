import React from 'react';
import { VulcanCard } from '../../components/examples/VulcanCard';

const VulcanThemePage: React.FC = () => {
  const vulcanColors = [
    { name: '50', value: 'var(--color-vulcan-50)', hex: '#f5f5fa' },
    { name: '100', value: 'var(--color-vulcan-100)', hex: '#ebecf3' },
    { name: '200', value: 'var(--color-vulcan-200)', hex: '#d2d4e5' },
    { name: '300', value: 'var(--color-vulcan-300)', hex: '#abb1ce' },
    { name: '400', value: 'var(--color-vulcan-400)', hex: '#7e88b2' },
    { name: '500', value: 'var(--color-vulcan-500)', hex: '#5e6999' },
    { name: '600', value: 'var(--color-vulcan-600)', hex: '#4a527f' },
    { name: '700', value: 'var(--color-vulcan-700)', hex: '#3d4367' },
    { name: '800', value: 'var(--color-vulcan-800)', hex: '#353a57' },
    { name: '900', value: 'var(--color-vulcan-900)', hex: '#30334a' },
    { name: '950', value: 'var(--color-vulcan-950)', hex: '#14151f' },
  ];

  const cardData = [
    {
      title: 'Vulcan Theme Design',
      description:
        'A sleek, professional UI theme with elegant blues and purples for modern web applications.',
      imageUrl:
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=3000&auto=format&fit=crop',
      tags: ['Design', 'Modern', 'Professional'],
    },
    {
      title: 'Dark Mode Experience',
      description:
        'Optimized for eye comfort and focus, our dark theme reduces eye strain during nighttime use.',
      imageUrl:
        'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=3000&auto=format&fit=crop',
      tags: ['Dark Mode', 'UX', 'Accessibility'],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-vulcan-50)]">
      <header className="bg-[var(--color-vulcan-900)] text-white py-12">
        <div className="container-custom flex-col-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Vulcan Color Palette</h1>
          <p className="text-[var(--color-vulcan-200)] text-center max-w-2xl mb-8">
            A sophisticated color system designed for modern web interfaces
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn-primary">Get Started</button>
            <button className="btn-outline text-[var(--color-vulcan-200)] border-[var(--color-vulcan-700)]">
              View Documentation
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        {/* Color Palette Display */}
        <section className="mb-16">
          <h2 className="heading-2 mb-8 text-center">Color Palette</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-11 gap-2 mb-12">
            {vulcanColors.map(color => (
              <div key={color.name} className="flex flex-col">
                <div
                  className="h-24 rounded-t-md flex items-end p-2"
                  style={{ backgroundColor: color.value }}
                >
                  <span
                    className={`text-xs font-mono ${parseInt(color.name) > 500 ? 'text-white' : 'text-[var(--color-vulcan-950)]'}`}
                  >
                    {color.name}
                  </span>
                </div>
                <div className="bg-white border border-[var(--color-vulcan-200)] rounded-b-md p-2">
                  <span className="text-xs font-mono text-[var(--color-vulcan-600)]">
                    {color.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Color Token Examples */}
          <div className="card p-6">
            <h3 className="heading-3 mb-4">Usage Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[var(--color-vulcan-800)] font-semibold mb-2">Text Colors</h4>
                <p className="text-[var(--color-vulcan-950)] mb-1">
                  Primary Text: var(--color-vulcan-950)
                </p>
                <p className="text-[var(--color-vulcan-800)] mb-1">
                  Secondary Text: var(--color-vulcan-800)
                </p>
                <p className="text-[var(--color-vulcan-600)] mb-1">
                  Tertiary Text: var(--color-vulcan-600)
                </p>
                <p className="text-[var(--color-vulcan-400)] mb-1">
                  Subtle Text: var(--color-vulcan-400)
                </p>
              </div>
              <div>
                <h4 className="text-[var(--color-vulcan-800)] font-semibold mb-2">
                  Background Colors
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="p-2 rounded bg-[var(--color-vulcan-50)] border border-[var(--color-vulcan-100)]">
                    Page Background: var(--color-vulcan-50)
                  </div>
                  <div className="p-2 rounded bg-white border border-[var(--color-vulcan-100)]">
                    Card Background: white
                  </div>
                  <div className="p-2 rounded bg-[var(--color-vulcan-900)] text-white">
                    Dark Background: var(--color-vulcan-900)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample UI Components */}
        <section className="mb-16">
          <h2 className="heading-2 mb-8 text-center">Sample UI Components</h2>

          <div className="flex gap-6 mb-8 flex-wrap">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-outline">Outline Button</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="card p-6">
              <h3 className="heading-3 mb-4">Form Elements</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input mt-1" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input mt-1" placeholder="Enter your password" />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[var(--color-vulcan-600)] focus:ring-[var(--color-vulcan-500)] border-[var(--color-vulcan-300)] rounded"
                  />
                  <label className="ml-2 text-sm text-[var(--color-vulcan-700)]">Remember me</label>
                </div>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-[var(--color-vulcan-50)] text-xl font-semibold mb-4">
                Dark Mode Components
              </h3>
              <div className="space-y-4">
                <p className="text-[var(--color-vulcan-200)]">
                  Dark mode provides better readability in low-light environments and reduces eye
                  strain.
                </p>
                <div className="flex gap-2">
                  <button className="bg-[var(--color-vulcan-800)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-vulcan-700)] transition-colors">
                    Dark Action
                  </button>
                  <button className="bg-transparent border border-[var(--color-vulcan-700)] text-[var(--color-vulcan-300)] px-4 py-2 rounded-md hover:bg-[var(--color-vulcan-800)] transition-colors">
                    Secondary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Cards */}
        <section>
          <h2 className="heading-2 mb-8 text-center">Sample Cards</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VulcanCard {...cardData[0]} variant="light" />
            <VulcanCard {...cardData[1]} variant="dark" />
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-vulcan-900)] text-[var(--color-vulcan-200)] py-12">
        <div className="container-custom text-center">
          <h2 className="text-[var(--color-vulcan-50)] text-2xl font-bold mb-4">
            BRYAN GABRIEL FE Template
          </h2>
          <p className="mb-6">A modern frontend template featuring Tailwind CSS v4</p>
          <p className="text-sm">© 2023 All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default VulcanThemePage;
