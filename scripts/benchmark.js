const Benchmark = require('benchmark');
const path = require('path');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');
const { optimizeImage, optimizeCSS, optimizeJS } = require('../src/utils/performance');

async function runBenchmarks() {
  console.log('Running PaulJS Performance Benchmarks...\n');

  const suite = new Benchmark.Suite;

  suite.add('Component Rendering', {
    defer: true,
    fn: async (deferred) => {
      const hero = require('../src/components/hero');
      const cta = require('../src/components/cta');
      const footer = require('../src/components/footer');

      await Promise.all([
        hero.render(),
        cta.render(),
        footer.render()
      ]);

      deferred.resolve();
    }
  })
  .add('React Conversion', {
    defer: true,
    fn: async (deferred) => {
      const { convertToReactComponent } = require('../src/adapters/react');
      const hero = require('../src/components/hero');
      
      await convertToReactComponent(hero);
      deferred.resolve();
    }
  })
  .add('Asset Optimization', {
    defer: true,
    fn: async (deferred) => {
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
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\nFastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

  console.log('\nMemory Usage Benchmark:');
  const initialMemory = process.memoryUsage();
  
  const components = [
    require('../src/components/hero'),
    require('../src/components/cta'),
    require('../src/components/footer')
  ];

  for (let i = 0; i < 1000; i++) {
    await Promise.all(components.map(c => c.render()));
  }

  const finalMemory = process.memoryUsage();
  
  console.log('Memory Impact:');
  console.log('- Heap Used:', Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024), 'MB');
  console.log('- RSS:', Math.round((finalMemory.rss - initialMemory.rss) / 1024 / 1024), 'MB');

  console.log('\nBuild Time Benchmark:');
  const buildStart = performance.now();
  
  try {
    await require('./build')();
    const buildTime = performance.now() - buildStart;
    console.log(`Build completed in ${Math.round(buildTime)}ms`);
  } catch (error) {
    console.error('Build failed:', error);
  }
}

runBenchmarks().catch(console.error);