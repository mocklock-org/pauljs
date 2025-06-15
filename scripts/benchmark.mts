import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Set up path resolution for ESM
const require = createRequire(fileURLToPath(import.meta.url));

// Import types for Benchmark.js
import type { Suite, Options, Target } from 'benchmark';

// Since benchmark is CommonJS, we need to require it
const Benchmark = require('benchmark') as { Suite: new () => Suite };

// Import our performance utilities
const { optimizeCSS, optimizeJS } = await import('../src/utils/performance.mts');

// Type definitions for our components
interface Component {
  name?: string;
  render(): Promise<string>;
  react(props: Record<string, unknown>): {
    component(props: Record<string, unknown>): string;
  };
}

// Mock component for testing
const createMockComponent = (name: string): Component => ({
  name,
  async render() {
    await Promise.resolve(); // Simulate async work
    return `<div>Mock ${name}</div>`;
  },
  react: () => ({
    component: () => `<div>Mock ${name}</div>`
  })
});

async function runBenchmarks(): Promise<void> {
  console.log('Running PaulJS Performance Benchmarks...\n');

  const suite = new Benchmark.Suite();

  // Component Rendering Benchmark
  suite.add('Component Rendering', {
    defer: true,
    async fn(deferred: { resolve: () => void }) {
      const components = [
        createMockComponent('Hero'),
        createMockComponent('CTA'),
        createMockComponent('Footer')
      ];

      await Promise.all(components.map(c => c.render()));
      deferred.resolve();
    }
  });

  // React Conversion Benchmark
  suite.add('React Conversion', {
    defer: true,
    async fn(deferred: { resolve: () => void }) {
      const component = createMockComponent('TestComponent');
      const mockReactConversion = (comp: Component): string => 
        `function ${comp.name || 'Component'}() { return ${comp.react({}).component({})}; }`;

      await Promise.resolve(); // Simulate async work
      mockReactConversion(component);
      deferred.resolve();
    }
  });

  // Asset Optimization Benchmark
  suite.add('Asset Optimization', {
    defer: true,
    fn: async (deferred: { resolve: () => void }) => {
      const css = `
        .test {
          color: red;
          background: blue;
          padding: 10px;
          margin: 20px;
        }
      `;

      const js = `
        function test() {
          console.log('test');
          return 42;
        }
      `;

      await Promise.all([
        optimizeCSS(css),
        optimizeJS(js)
      ]);

      deferred.resolve();
    }
  });

  // Add event handlers
  suite
    .on('cycle', (event: { target: Target }) => {
      console.log(String(event.target));
    })
    .on('complete', function(this: Suite) {
      const fastest = this.filter('fastest').map('name');
      console.log('\nFastest is ' + fastest.join(', '));
    });

  // Run the suite
  suite.run({ async: true } as Options);

  // Memory Usage Benchmark
  console.log('\nMemory Usage Benchmark:');
  const initialMemory = process.memoryUsage();
  
  const components = Array(3).fill(null).map((_, i) => 
    createMockComponent(`Component${i + 1}`)
  );

  for (let i = 0; i < 1000; i++) {
    await Promise.all(components.map(c => c.render()));
  }

  const finalMemory = process.memoryUsage();
  
  console.log('Memory Impact:');
  console.log('- Heap Used:', Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024), 'MB');
  console.log('- RSS:', Math.round((finalMemory.rss - initialMemory.rss) / 1024 / 1024), 'MB');

  // Build Time Benchmark
  console.log('\nBuild Time Benchmark:');
  const buildStart = performance.now();
  
  try {
    const { default: build } = await import('./build.mjs');
    await build();
    const buildTime = performance.now() - buildStart;
    console.log(`Build completed in ${Math.round(buildTime)}ms`);
  } catch (error) {
    console.error('Build failed:', error instanceof Error ? error.message : String(error));
  }
}

// Run benchmarks and handle errors
void runBenchmarks().catch(error => {
  console.error('Benchmark failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
