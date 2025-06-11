const defaultProps = {
  title: 'Welcome to PaulJS',
  subtitle: 'Build fast landing pages with ease',
  ctaText: 'Get Started',
  ctaUrl: '#',
  backgroundColor: '#f8f9fa',
  textColor: '#212529'
};

function generateStyles(props) {
  return `
    .pauljs-hero {
      background-color: ${props.backgroundColor};
      color: ${props.textColor};
      padding: 4rem 2rem;
      text-align: center;
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .pauljs-hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      font-weight: bold;
    }
    .pauljs-hero p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      max-width: 600px;
    }
    .pauljs-hero-cta {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 1.25rem;
      font-weight: 600;
      text-decoration: none;
      color: #fff;
      background-color: #0d6efd;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
    }
    .pauljs-hero-cta:hover {
      background-color: #0b5ed7;
    }
  `;
}

function render(props = {}) {
  const mergedProps = { ...defaultProps, ...props };
  return `
    <style>${generateStyles(mergedProps)}</style>
    <section class="pauljs-hero">
      <h1>${mergedProps.title}</h1>
      <p>${mergedProps.subtitle}</p>
      <a href="${mergedProps.ctaUrl}" class="pauljs-hero-cta">${mergedProps.ctaText}</a>
    </section>
  `;
}

// React component factory
function react(props = {}) {
  return {
    component: ({ title, subtitle, ctaText, ctaUrl, backgroundColor, textColor } = { ...defaultProps, ...props }) => `
      const styles = ${JSON.stringify(generateStyles({ backgroundColor, textColor }))};
      
      return (
        <>
          <style>{styles}</style>
          <section className="pauljs-hero">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <a href={ctaUrl} className="pauljs-hero-cta">{ctaText}</a>
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