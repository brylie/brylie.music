<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> RSS Feed</title>
        <meta charset="utf-8"/>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          :root {
            --color-bg: #ffffff;
            --color-text: #1f2937;
            --color-text-muted: #6b7280;
            --color-border: #e5e7eb;
            --color-accent: #3b82f6;
            --color-accent-hover: #2563eb;
            --color-card-bg: #f9fafb;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --color-bg: #111827;
              --color-text: #f9fafb;
              --color-text-muted: #9ca3af;
              --color-border: #374151;
              --color-accent: #60a5fa;
              --color-accent-hover: #3b82f6;
              --color-card-bg: #1f2937;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--color-text);
            background-color: var(--color-bg);
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          
          .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--color-border);
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: var(--color-accent);
          }
          
          .header p {
            font-size: 1.125rem;
            color: var(--color-text-muted);
            margin: 0 0 1rem 0;
          }
          
          .rss-info {
            background: var(--color-card-bg);
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--color-border);
            margin-bottom: 2rem;
          }
          
          .rss-info h2 {
            margin: 0 0 1rem 0;
            font-size: 1.25rem;
            color: var(--color-accent);
          }
          
          .rss-info p {
            margin: 0 0 1rem 0;
            color: var(--color-text-muted);
          }
          
          .feed-url {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: 0.25rem;
            padding: 0.75rem;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            word-break: break-all;
            margin: 1rem 0;
          }
          
          .posts {
            margin-top: 2rem;
          }
          
          .post {
            background: var(--color-card-bg);
            border: 1px solid var(--color-border);
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: box-shadow 0.2s ease;
          }
          
          .post:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .post h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 600;
          }
          
          .post h3 a {
            color: var(--color-text);
            text-decoration: none;
          }
          
          .post h3 a:hover {
            color: var(--color-accent-hover);
          }
          
          .post-meta {
            color: var(--color-text-muted);
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
          
          .post-description {
            color: var(--color-text);
            line-height: 1.6;
            margin: 0;
          }
          
          .post-content {
            color: var(--color-text);
            line-height: 1.6;
            margin-top: 1rem;
          }
          
          .post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.25rem;
          }
          
          .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-border);
            color: var(--color-text-muted);
            font-size: 0.875rem;
          }
          
          .icon {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
            vertical-align: text-bottom;
          }
          
          @media (max-width: 640px) {
            .container {
              padding: 1rem;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .post {
              padding: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.429 2.414A1 1 0 004.5 2h11a1 1 0 00.707.293l1.5 1.5A1 1 0 0018 5v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 01.429-.586z"/>
              </svg>
              <xsl:value-of select="/rss/channel/title"/>
            </h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
          </div>
          
          <div class="rss-info">
            <h2>📡 RSS Feed</h2>
            <p>This is an RSS feed. Subscribe by copying the URL from the address bar into your RSS reader.</p>
            <div class="feed-url">
              <xsl:value-of select="/rss/channel/link"/>rss.xml
            </div>
            <p>Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with RSS feeds.</p>
          </div>
          
          <div class="posts">
            <xsl:for-each select="/rss/channel/item">
              <article class="post">
                <h3>
                  <a href="{link}" target="_blank">
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <div class="post-meta">
                  📅 <xsl:value-of select="pubDate"/>
                </div>
                <xsl:if test="description">
                  <div class="post-description">
                    <xsl:value-of select="description" disable-output-escaping="yes"/>
                  </div>
                </xsl:if>
              </article>
            </xsl:for-each>
          </div>
          
          <div class="footer">
            <p>Generated by Astro RSS</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
