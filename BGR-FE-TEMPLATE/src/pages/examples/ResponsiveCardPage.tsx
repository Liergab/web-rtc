import React from 'react';
import { ResponsiveCard } from '../../components/examples/ResponsiveCard';

const ResponsiveCardPage: React.FC = () => {
  // Sample data for cards
  const cardData = [
    {
      title: 'Modern Web Design',
      description:
        'Learn how to create beautiful, responsive web designs using the latest techniques and tools.',
      imageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      tags: ['Design', 'Web', 'Responsive'],
    },
    {
      title: 'React Development',
      description:
        'Master React.js and build dynamic, interactive user interfaces for modern web applications.',
      imageUrl:
        'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      tags: ['React', 'JavaScript', 'Frontend'],
    },
    {
      title: 'UX Fundamentals',
      description:
        'Understand the core principles of user experience design and how to apply them to your projects.',
      imageUrl:
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      tags: ['UX', 'Design', 'Research'],
    },
    {
      title: 'Tailwind CSS Mastery',
      description:
        'Learn how to rapidly build custom interfaces with Tailwind CSS utility-first approach.',
      imageUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      tags: ['CSS', 'Tailwind', 'Frontend'],
    },
  ];

  return (
    <div className="responsive-container section bg-[var(--color-vulcan-50)]">
      <header className="text-center mb-12">
        <h1 className="heading-1 mb-4">Responsive Card Examples</h1>
        <p className="paragraph max-w-2xl mx-auto">
          These cards showcase Tailwind CSS v4's responsive utilities. They adapt to different
          screen sizes, changing layout and content visibility.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="heading-2 text-center-left-on-tablet mb-6">Individual Card Example</h2>
        <div className="max-w-xl mx-auto">
          <ResponsiveCard {...cardData[0]} />
        </div>
      </section>

      <section>
        <h2 className="heading-2 text-center-left-on-tablet mb-6">Card Grid Example</h2>
        <div className="grid-cols-2 responsive-gap">
          {cardData.map((card, index) => (
            <ResponsiveCard key={index} {...card} />
          ))}
        </div>
      </section>

      <footer className="mt-20 text-center">
        <p className="paragraph">
          Built with <span className="text-[var(--color-vulcan-600)]">❤</span> using Tailwind CSS
          v4
        </p>
      </footer>
    </div>
  );
};

export default ResponsiveCardPage;
