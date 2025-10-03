const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // Serve static files
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check - don't serve files outside the project directory
    if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const content = fs.readFileSync(fullPath);
            
            // Set appropriate content type
            const ext = path.extname(fullPath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            };
            
            const contentType = contentTypes[ext] || 'text/plain';
            res.setHeader('Content-Type', contentType);
            res.send(content);
        } else {
            // Serve index.html for SPA routing
            const indexPath = path.join(process.cwd(), 'index.html');
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath);
                res.setHeader('Content-Type', 'text/html');
                res.send(content);
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        }
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
