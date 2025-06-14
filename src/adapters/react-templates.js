const functionComponentTemplate = `
import React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';

function COMPONENT_NAME({
  children,
  className,
  style,
  ...props
}) {
  // Component implementation
  COMPONENT_IMPLEMENTATION

  // Render method
  return RENDER_METHOD;
}

// Add display name for better debugging
COMPONENT_NAME.displayName = 'DISPLAY_NAME';

export default COMPONENT_NAME;
`;

const memoComponentTemplate = `
import React from 'react';
import { memo, useEffect, useState, useCallback, useMemo } from 'react';

function COMPONENT_NAME({
  children,
  className,
  style,
  ...props
}) {
  // Component implementation
  COMPONENT_IMPLEMENTATION

  // Render method
  return RENDER_METHOD;
}

// Add display name for better debugging
COMPONENT_NAME.displayName = 'DISPLAY_NAME';

// Memoize the component for better performance
export default memo(COMPONENT_NAME);
`;

const forwardRefComponentTemplate = `
import React from 'react';
import { forwardRef, useEffect, useState, useCallback, useMemo } from 'react';

const COMPONENT_NAME = forwardRef(({
  children,
  className,
  style,
  ...props
}, ref) => {
  // Component implementation
  COMPONENT_IMPLEMENTATION

  // Render method
  return RENDER_METHOD;
});

// Add display name for better debugging
COMPONENT_NAME.displayName = 'DISPLAY_NAME';

export default COMPONENT_NAME;
`;

module.exports = {
  functionComponentTemplate,
  memoComponentTemplate,
  forwardRefComponentTemplate
}; 