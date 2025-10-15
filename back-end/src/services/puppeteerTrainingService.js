const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { supabase } = require('./supabaseService');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

class PuppeteerTrainingService {
  constructor() {
    this.maxPages = 30;
    this.maxDepth = 2;
    this.visitedUrls = new Set();
    this.browser = null;
  }

  /**
   * Train a chatbot by scraping a website with Puppeteer (bypasses Cloudflare)
   */
  async trainWebsite(chatbotId, startUrl, jobId) {
    console.log(`🚀 Starting Puppeteer training for chatbot ${chatbotId} from ${startUrl}`);
    
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

      // Launch browser
      console.log('🌐 Launching browser...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });

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

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
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
      
      // Close browser on error
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      // Update job status to failed
      await this.updateJobStatus(jobId, 'failed', {
        error_message: error.message
      });

      throw error;
    }
  }

  /**
   * Scrape a single page with Puppeteer and follow links
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

    let page = null;

    try {
      console.log(`📄 Scraping: ${url}`);
      this.visitedUrls.add(url);

      // Create new page
      page = await this.browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navigate to page with longer timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a bit for any lazy-loaded content (use setTimeout instead of waitForTimeout)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract content
      const pageData = await page.evaluate(() => {
        // Remove unwanted elements
        const unwantedSelectors = ['script', 'style', 'nav', 'footer', 'header', 'iframe', 'noscript'];
        unwantedSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Get title
        const title = document.title || 'Untitled';

        // Get meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        const description = metaDesc ? metaDesc.getAttribute('content') : '';

        // Get main content
        const contentSelectors = ['main', 'article', '[role="main"]', '.content', '.main-content', '#content', 'body'];
        let content = '';
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.innerText;
            break;
          }
        }

        // Get all links
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href && href.startsWith('http'));

        return {
          title,
          description,
          content: content.replace(/\s+/g, ' ').trim(),
          links
        };
      });

      // Only save if we have meaningful content
      if (pageData.content.length > 100) {
        documents.push({
          chatbot_id: chatbotId,
          url: url,
          content: pageData.content.substring(0, 10000),
          metadata: {
            title: pageData.title.substring(0, 255),
            description: pageData.description.substring(0, 500),
            scraped_at: new Date().toISOString()
          }
        });

        console.log(`✅ Extracted content from ${url} (${pageData.content.length} chars)`);
      }

      // Close the page
      await page.close();
      page = null;

      // Process links if not at max depth
      if (depth < this.maxDepth && pageData.links.length > 0) {
        const relevantLinks = pageData.links.filter(link => {
          try {
            const linkUrl = new URL(link);
            
            // Only follow links on the same domain
            if (linkUrl.hostname !== baseDomain) return false;
            if (this.visitedUrls.has(link)) return false;
            if (this.visitedUrls.size >= this.maxPages) return false;

            // Skip common non-content patterns
            const skipPatterns = [
              '/wp-admin/', '/wp-login/', '/login', '/signup', '/register',
              '/cart', '/checkout', '/account', '/my-account',
              '.pdf', '.jpg', '.png', '.gif', '.zip', '.doc',
              '/tag/', '/category/', '/author/', '/search'
            ];

            return !skipPatterns.some(pattern => link.toLowerCase().includes(pattern));
          } catch (e) {
            return false;
          }
        });

        // Process links sequentially (avoid overwhelming the server)
        for (const link of relevantLinks.slice(0, 5)) {
          if (this.visitedUrls.size >= this.maxPages) break;
          
          await this.scrapePage(link, baseDomain, depth + 1, documents, chatbotId);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.log(`⚠️  Error scraping ${url}: ${error.message}`);
      
      // Close page on error
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore close errors
        }
      }
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

module.exports = new PuppeteerTrainingService();
