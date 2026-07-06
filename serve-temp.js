const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = 'C:\\Users\\USER\\Downloads\\eiger-marvel-hr-plat\\dist';
const mime = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json','.txt':'text/plain','.xml':'application/xml','.avif':'image/avif' };
http.createServer((req,res)=>{
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const fp = path.join(dist, p);
  const ext = path.extname(fp);
  fs.readFile(fp, (err,data)=>{
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {'Content-Type': mime[ext]||'application/octet-stream'});
    res.end(data);
  });
}).listen(5177, '0.0.0.0', ()=>console.log('Server: http://localhost:5177'));