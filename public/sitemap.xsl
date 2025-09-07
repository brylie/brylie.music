<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>brylie.music - Sitemap</title>
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
            --color-success: #10b981;
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
              --color-success: #34d399;
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
            max-width: 1200px;
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
            margin: 0;
          }
          
          .sitemap-info {
            background: var(--color-card-bg);
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--color-border);
            margin-bottom: 2rem;
          }
          
          .sitemap-info h2 {
            margin: 0 0 1rem 0;
            font-size: 1.25rem;
            color: var(--color-accent);
          }
          
          .sitemap-info p {
            margin: 0 0 1rem 0;
            color: var(--color-text-muted);
          }
          
          .stats {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin: 2rem 0;
            flex-wrap: wrap;
          }
          
          .stat {
            background: var(--color-card-bg);
            border: 1px solid var(--color-border);
            border-radius: 0.5rem;
            padding: 1rem 1.5rem;
            text-align: center;
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-success);
            display: block;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .urls-table {
            background: var(--color-card-bg);
            border: 1px solid var(--color-border);
            border-radius: 0.5rem;
            overflow: hidden;
            margin-top: 2rem;
          }
          
          .urls-table table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .urls-table th,
          .urls-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--color-border);
          }
          
          .urls-table th {
            background: var(--color-bg);
            font-weight: 600;
            color: var(--color-text);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .urls-table td {
            font-size: 0.875rem;
            vertical-align: top;
          }
          
          .urls-table tr:last-child td {
            border-bottom: none;
          }
          
          .urls-table tr:hover {
            background: var(--color-bg);
          }
          
          .url-link {
            color: var(--color-accent);
            text-decoration: none;
            word-break: break-all;
          }
          
          .url-link:hover {
            color: var(--color-accent-hover);
            text-decoration: underline;
          }
          
          .priority {
            font-weight: 600;
          }
          
          .priority-high {
            color: var(--color-success);
          }
          
          .priority-medium {
            color: #f59e0b;
          }
          
          .priority-low {
            color: var(--color-text-muted);
          }
          
          .changefreq {
            text-transform: capitalize;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            background: var(--color-border);
            border-radius: 0.25rem;
          }
          
          .lastmod {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            color: var(--color-text-muted);
          }
          
          .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-border);
            color: var(--color-text-muted);
            font-size: 0.875rem;
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 1rem;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .stats {
              gap: 1rem;
            }
            
            .urls-table {
              overflow-x: auto;
            }
            
            .urls-table th,
            .urls-table td {
              padding: 0.75rem 0.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ brylie.music Sitemap</h1>
            <p>This XML sitemap contains all the pages on brylie.music for search engines to crawl and index.</p>
          </div>
          
          <div class="sitemap-info">
            <h2>📄 About XML Sitemaps</h2>
            <p>This is an XML sitemap used by search engines like Google, Bing, and others to better understand and index the website. It contains a list of all important pages along with metadata about when they were last modified, how often they change, and their relative priority.</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <span class="stat-number">
                <xsl:value-of select="count(//sm:url)"/>
              </span>
              <span class="stat-label">Total URLs</span>
            </div>
            <div class="stat">
              <span class="stat-number">
                <xsl:value-of select="format-date(current-date(), '[Y0001]-[M01]-[D01]')"/>
              </span>
              <span class="stat-label">Generated</span>
            </div>
          </div>
          
          <div class="urls-table">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                  <th>Change Frequency</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="//sm:url">
                  <xsl:sort select="sm:priority" order="descending" data-type="number"/>
                  <tr>
                    <td>
                      <a href="{sm:loc}" class="url-link" target="_blank">
                        <xsl:value-of select="sm:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:if test="sm:lastmod">
                        <span class="lastmod">
                          <xsl:value-of select="substring(sm:lastmod, 1, 10)"/>
                        </span>
                      </xsl:if>
                    </td>
                    <td>
                      <xsl:if test="sm:changefreq">
                        <span class="changefreq">
                          <xsl:value-of select="sm:changefreq"/>
                        </span>
                      </xsl:if>
                    </td>
                    <td>
                      <xsl:if test="sm:priority">
                        <span class="priority">
                          <xsl:attribute name="class">
                            priority
                            <xsl:choose>
                              <xsl:when test="sm:priority &gt;= 0.8">
                                priority-high
                              </xsl:when>
                              <xsl:when test="sm:priority &gt;= 0.5">
                                priority-medium
                              </xsl:when>
                              <xsl:otherwise>
                                priority-low
                              </xsl:otherwise>
                            </xsl:choose>
                          </xsl:attribute>
                          <xsl:value-of select="sm:priority"/>
                        </span>
                      </xsl:if>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated by Astro Sitemap Integration</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
