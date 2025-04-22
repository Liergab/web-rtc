import React from 'react';

const TailwindApplyExample: React.FC = () => {
  return (
    <div className="section responsive-container">
      <h1 className="heading-1 mb-6">Tailwind CSS @apply Example</h1>

      <div className="grid-cols-2 responsive-gap mb-8">
        <div className="card card-hover responsive-padding">
          <h2 className="heading-3 mb-4">Using CSS Utility Classes</h2>
          <p className="paragraph mb-4">
            This component uses utility classes defined with Tailwind's @apply directive in our
            index.css file. This approach keeps styling in CSS while leveraging Tailwind's
            utility-first methodology.
          </p>
          <div className="flex-between">
            <button className="btn-primary">Primary Action</button>
            <button className="btn-outline">Secondary Action</button>
          </div>
        </div>

        <div className="card-with-padding">
          <h2 className="heading-3 mb-4">Responsive Examples</h2>
          <div className="stack-to-row responsive-gap">
            <div className="half-on-tablet">
              <p className="text-center-left-on-tablet paragraph">
                This text is centered on mobile but left-aligned on tablets and above.
              </p>
              <div className="show-only-on-mobile mt-4">
                <span className="bg-red-100 px-2 py-1 rounded text-red-800 text-sm">
                  Only visible on mobile
                </span>
              </div>
            </div>
            <div className="half-on-tablet">
              <div className="hide-on-mobile">
                <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 text-sm">
                  Hidden on mobile
                </span>
              </div>
              <p className="paragraph mt-4">
                Using classes like <code>.stack-to-row</code> helps create layouts that adapt to
                different screen sizes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-col-center">
        <div className="card responsive-padding w-full max-w-lg">
          <h2 className="heading-2 mb-4">Form Example</h2>
          <form>
            <div className="form-group">
              <label htmlFor="name" className="label">
                Name
              </label>
              <input type="text" id="name" className="input" placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input type="email" id="email" className="input" placeholder="Enter your email" />
            </div>
            <div className="flex-end">
              <button type="submit" className="btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TailwindApplyExample;
