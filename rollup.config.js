import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'src/KissMetricsForwarder.js',
    output: {
        file: 'KissMetricsForwarder.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-kissMetrics-kit',
        strict: false
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs()
    ]
},
{
    input: 'src/KissMetricsForwarder.js',
    output: {
        file: 'dist/KissMetricsForwarder.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-kissMetrics-kit',
        strict: false
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs()
    ]
}
] 