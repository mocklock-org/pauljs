const defaultProps = {
  companyName: 'PaulJS',
  year: new Date().getFullYear(),
  links: [
    { text: 'Documentation', url: '#docs' },
    { text: 'GitHub', url: '#github' },
    { text: 'Examples', url: '#examples' },
    { text: 'Contact', url: '#contact' }
  ],
  backgroundColor: '#f8f9fa',
  textColor: '#6c757d'
};

function generateStyles(props) {
  return `
    .pauljs-footer {
      background-color: ${props.backgroundColor};
      color: ${props.textColor};
      padding: 3rem 2rem;
      text-align: center;
    }
    .pauljs-footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .pauljs-footer-link {
      color: ${props.textColor};
      text-decoration: none;
      transition: color 0.2s;
    }
    .pauljs-footer-link:hover {
      color: #0d6efd;
    }
    .pauljs-footer-copyright {
      font-size: 0.875rem;
    }
  `;
}

function render(props = {}) {
  const mergedProps = Object.assign({}, defaultProps, props);
  const links = mergedProps.links.map(link => 
    `<a href="${link.url}" class="pauljs-footer-link">${link.text}</a>`
  ).join('');

  return `
    <style>${generateStyles(mergedProps)}</style>
    <footer class="pauljs-footer">
      <div class="pauljs-footer-links">
        ${links}
      </div>
      <div class="pauljs-footer-copyright">
        © ${mergedProps.year} ${mergedProps.companyName}. All rights reserved.
      </div>
    </footer>
  `;
}

function react(props = {}) {
  const mergedProps = Object.assign({}, defaultProps, props);
  return {
    component: ({
      companyName,
      year,
      links,
      backgroundColor,
      textColor
    } = mergedProps) => `
      const styles = ${JSON.stringify(generateStyles({ backgroundColor, textColor }))};
      
      return (
        <>
          <style>{styles}</style>
          <footer className="pauljs-footer">
            <div className="pauljs-footer-links">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="pauljs-footer-link"
                >
                  {link.text}
                </a>
              ))}
            </div>
            <div className="pauljs-footer-copyright">
              © {year} {companyName}. All rights reserved.
            </div>
          </footer>
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