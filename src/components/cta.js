const defaultProps = {
  title: 'Ready to get started?',
  description: 'Join thousands of developers building amazing landing pages with PaulJS',
  primaryButtonText: 'Get Started',
  primaryButtonUrl: '#',
  secondaryButtonText: 'Learn More',
  secondaryButtonUrl: '#docs',
  backgroundColor: '#ffffff',
  textColor: '#212529'
};

function generateStyles(props) {
  return `
    .pauljs-cta {
      background-color: ${props.backgroundColor};
      color: ${props.textColor};
      padding: 4rem 2rem;
      text-align: center;
    }
    .pauljs-cta h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    .pauljs-cta p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .pauljs-cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .pauljs-cta-primary {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 1.125rem;
      font-weight: 600;
      text-decoration: none;
      color: #fff;
      background-color: #0d6efd;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
    }
    .pauljs-cta-primary:hover {
      background-color: #0b5ed7;
    }
    .pauljs-cta-secondary {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 1.125rem;
      font-weight: 600;
      text-decoration: none;
      color: #0d6efd;
      background-color: transparent;
      border: 2px solid #0d6efd;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }
    .pauljs-cta-secondary:hover {
      color: #fff;
      background-color: #0d6efd;
    }
  `;
}

function render(props = {}) {
  const mergedProps = { ...defaultProps, ...props };
  return `
    <style>${generateStyles(mergedProps)}</style>
    <section class="pauljs-cta">
      <h2>${mergedProps.title}</h2>
      <p>${mergedProps.description}</p>
      <div class="pauljs-cta-buttons">
        <a href="${mergedProps.primaryButtonUrl}" class="pauljs-cta-primary">
          ${mergedProps.primaryButtonText}
        </a>
        <a href="${mergedProps.secondaryButtonUrl}" class="pauljs-cta-secondary">
          ${mergedProps.secondaryButtonText}
        </a>
      </div>
    </section>
  `;
}

// React component factory
function react(props = {}) {
  return {
    component: ({
      title,
      description,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      backgroundColor,
      textColor
    } = { ...defaultProps, ...props }) => `
      const styles = ${JSON.stringify(generateStyles({ backgroundColor, textColor }))};
      
      return (
        <>
          <style>{styles}</style>
          <section className="pauljs-cta">
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="pauljs-cta-buttons">
              <a href={primaryButtonUrl} className="pauljs-cta-primary">
                {primaryButtonText}
              </a>
              <a href={secondaryButtonUrl} className="pauljs-cta-secondary">
                {secondaryButtonText}
              </a>
            </div>
          </section>
        </>
      );
    `
  };
}

module.exports = {
  render,
  react,
  defaultProps
}; 