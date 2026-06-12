import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Endpoint to fetch Higgsfield page and resolve the direct video url
  app.get("/api/video-src", async (req, res) => {
    try {
      const shareUrl = "https://higgsfield.ai/s/wc6k5c_eyn8";
      console.log(`[API] Resolving Higgsfield video URL: ${shareUrl}`);

      const response = await fetch(shareUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load share page. Status: ${response.status}`);
      }

      const html = await response.text();
      console.log(`[API] Share page HTML loaded. Length: ${html.length} bytes`);

      // 1. og:video properties (very standard metadata)
      const ogVideoMeta = html.match(/<meta[^>]*property=["']og:video(?::secure_url)?["'][^>]*content=["'](.*?)["']/i) ||
                          html.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:video(?::secure_url)?["']/i);
      if (ogVideoMeta && ogVideoMeta[1]) {
        const decodedUrl = ogVideoMeta[1].replace(/&amp;/g, "&");
        console.log(`[API] Success! Found og:video URL: ${decodedUrl}`);
        return res.json({ url: decodedUrl });
      }

      // 2. Look for explicit video source tag or video src attribute in the HTML string
      const sourceTag = html.match(/<source[^>]*src=["'](.*?)["']/i) || html.match(/<video[^>]*src=["'](.*?)["']/i);
      if (sourceTag && sourceTag[1]) {
        const decodedUrl = sourceTag[1].replace(/&amp;/g, "&");
        console.log(`[API] Success! Found video element src URL: ${decodedUrl}`);
        return res.json({ url: decodedUrl });
      }

      // 3. Search for quoted mp4 links (often found in inline script variables, Next.js page states, React props)
      const quoteMatches = html.match(/"([^"]+?\.mp4(?:\?[^"]+?)?)"/i) || html.match(/'([^']+?\.mp4(?:\?[^']+?)?)'/i);
      if (quoteMatches && quoteMatches[1]) {
        const decodedUrl = quoteMatches[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
        console.log(`[API] Success! Found quoted mp4 URL: ${decodedUrl}`);
        return res.json({ url: decodedUrl });
      }

      // 4. Fallback search for any string pattern resembling an https mp4 url
      const rawMp4 = html.match(/(https:\/\/[^\s"'`<>\\\{\}\[\]]+?\.mp4[^\s"'`<>\\\{\}\[\]]*)/i);
      if (rawMp4 && rawMp4[1]) {
        const decodedUrl = rawMp4[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
        console.log(`[API] Success! Found fallback raw mp4 URL: ${decodedUrl}`);
        return res.json({ url: decodedUrl });
      }

      // Fallback: If nothing works, export the page structure snippet or return raw share page URL directly
      console.warn("[API] Could not extract direct video url patterns. Returning original shareUrl as fallback.");
      return res.json({ url: shareUrl, isFallback: true });
    } catch (error: any) {
      console.error("[API] Error fetching or parsing Higgsfield share page:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Serve static assets based on environment (Vite dev server in dev mode vs static express build)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer();
