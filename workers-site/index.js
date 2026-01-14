/**
 * Eiger Marvel HR Platform - Cloudflare Workers Entry Point
 * Handles static site serving from the dist folder
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Log request for debugging
    console.log(`${request.method} ${url.pathname}`);
    
    try {
      // Try to serve the requested resource
      const response = await env.ASSETS.fetch(request);
      
      // If it's not found and it's not an API route, try serving index.html (SPA routing)
      if (response.status === 404 && !url.pathname.startsWith('/api/')) {
        // Check if it's trying to access an HTML page (has no file extension or is a directory)
        const hasExtension = /\.\w+$/.test(url.pathname);
        
        if (!hasExtension || url.pathname.endsWith('/')) {
          // Serve index.html for SPA routing
          const indexResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url).toString(), request));
          
          if (indexResponse.status === 200) {
            // Return index.html with proper cache headers
            const newResponse = new Response(indexResponse.body, indexResponse);
            newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
            return newResponse;
          }
        }
      }
      
      // Return the response with appropriate cache headers
      if (response.status === 200) {
        const newResponse = new Response(response.body, response);
        
        // Set cache headers based on file type
        if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)) {
          // Cache immutable assets for 1 year
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
          // Cache images for 30 days
          newResponse.headers.set('Cache-Control', 'public, max-age=2592000');
        } else {
          // Don't cache HTML for long
          newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
        }
        
        return newResponse;
      }
      
      return response;
    } catch (error) {
      console.error('Error serving request:', error);
      
      // Return a 500 error page
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
