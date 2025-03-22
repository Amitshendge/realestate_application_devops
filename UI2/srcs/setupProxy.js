const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://147.93.112.162:2005',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ message: 'Proxy error' });
      },
    })
  );
};