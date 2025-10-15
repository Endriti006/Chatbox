const axios = require('axios');
const cheerio = require('cheerio');
const { supabase } = require('./supabaseService');

class TrainingService {
  constructor() {
    this.maxPages = 30; // Increased from 20 to get more content
    this.maxDepth = 2; // How many levels deep to follow links
    this.visitedUrls = new Set();
  }

  /**
   * Train a chatbot by scraping a website
   */
  async trainWebsite(chatbotId, startUrl, jobId) {
    console.log(`🚀 Starting training for chatbot ${chatbotId} from ${startUrl}`);
    
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing', { pages_processed: 0 });

      // Normalize URL
      const baseUrl = new URL(startUrl);
      const baseDomain = baseUrl.hostname;

      // Clear existing documents for this chatbot
      await supabase
        .from('documents')
        .delete()
        .eq('chatbot_id', chatbotId);

      console.log(`🗑️  Cleared existing documents for chatbot ${chatbotId}`);

      // Scrape the website
      const documents = [];
      await this.scrapePage(startUrl, baseDomain, 0, documents, chatbotId);

      console.log(`✅ Scraped ${documents.length} pages`);

      // Save documents to database
      if (documents.length > 0) {
        const { error: insertError } = await supabase
          .from('documents')
          .insert(documents);

        if (insertError) {
          throw new Error(`Failed to insert documents: ${insertError.message}`);
        }
      }

      // Update job status to completed
      await this.updateJobStatus(jobId, 'completed', {
        pages_processed: documents.length,
        completed_at: new Date().toISOString()
      });

      console.log(`✅ Training completed for chatbot ${chatbotId}`);
      return { success: true, pagesProcessed: documents.length };

    } catch (error) {
      console.error(`❌ Training failed for chatbot ${chatbotId}:`, error);
      
      // Update job status to failed
      await this.updateJobStatus(jobId, 'failed', {
        error_message: error.message
      });

      throw error;
    }
  }

  /**
   * Scrape a single page and follow links
   */
  async scrapePage(url, baseDomain, depth, documents, chatbotId) {
    // Check limits
    if (this.visitedUrls.size >= this.maxPages) {
      console.log(`⚠️  Reached max pages limit (${this.maxPages})`);
      return;
    }

    if (depth > this.maxDepth) {
      return;
    }

    if (this.visitedUrls.has(url)) {
      return;
    }

    try {
      console.log(`📄 Scraping: ${url}`);
      this.visitedUrls.add(url);

      // Add delay to avoid overwhelming the server and bypass Cloudflare
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      // Fetch the page with better headers to bypass Cloudflare
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        }
      });

      if (!response.data) {
        return;
      }

      // Parse HTML
      const $ = cheerio.load(response.data);

      // Remove script, style, and other non-content elements
      $('script, style, nav, footer, header, iframe, noscript').remove();

      // Extract text content
      const title = $('title').text().trim() || 'Untitled';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Get main content - try common content containers first
      let content = '';
      const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.main-content',
        '#content',
        'body'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length) {
          content = element.text();
          break;
        }
      }

      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();

      // Only save if we have meaningful content
      if (content.length > 100) {
        const doc = {
          chatbot_id: chatbotId,
          url: url,
          content: content.substring(0, 10000), // Limit content size
          metadata: {
            title: title.substring(0, 255),
            description: metaDescription.substring(0, 500),
            scraped_at: new Date().toISOString()
          }
        };
        
        documents.push(doc);

        console.log(`✅ Extracted content from ${url} (${content.length} chars)`);
      }

      // Find and follow links on the same domain
      if (depth < this.maxDepth) {
        const links = $('a[href]');
        const promises = [];

        links.each((i, link) => {
          try {
            const href = $(link).attr('href');
            if (!href) return;

            // Parse the link
            const linkUrl = new URL(href, url);
            
            // Only follow links on the same domain
            if (linkUrl.hostname === baseDomain && 
                linkUrl.protocol.startsWith('http') &&
                !this.visitedUrls.has(linkUrl.href) &&
                this.visitedUrls.size < this.maxPages) {
              
              // Skip common non-content pages
              const skipPatterns = [
                '/wp-admin/', '/wp-login/', '/login', '/signup',
                '/cart', '/checkout', '.pdf', '.jpg', '.png', '.gif',
                '/tag/', '/category/', '/author/'
              ];

              const shouldSkip = skipPatterns.some(pattern => 
                linkUrl.href.toLowerCase().includes(pattern)
              );

              if (!shouldSkip) {
                promises.push(
                  this.scrapePage(linkUrl.href, baseDomain, depth + 1, documents, chatbotId)
                    .catch(err => {
                      // Continue on individual page errors
                      console.log(`⚠️  Failed to scrape ${linkUrl.href}: ${err.message}`);
                    })
                );
              }
            }
          } catch (e) {
            // Invalid URL, skip it
          }
        });

        // Wait for all links to be processed (with concurrency limit)
        if (promises.length > 0) {
          // Process links in batches of 3 to avoid overwhelming the server
          for (let i = 0; i < promises.length; i += 3) {
            const batch = promises.slice(i, i + 3);
            await Promise.all(batch);
          }
        }
      }

    } catch (error) {
      console.log(`⚠️  Error scraping ${url}: ${error.message}`);
    }
  }

  /**
   * Update training job status
   */
  async updateJobStatus(jobId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...additionalData
      };

      const { error } = await supabase
        .from('training_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        console.error('Failed to update job status:', error);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  }

  /**
   * Reset visited URLs (for new training session)
   */
  reset() {
    this.visitedUrls.clear();
  }
}

module.exports = new TrainingService();
