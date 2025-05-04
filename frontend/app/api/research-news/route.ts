import { NextResponse } from "next/server";
import Parser from 'rss-parser';

// Define the structure for our news items
interface NewsItem {
  title: string;
  link: string;
  summary: string;
  published: string;
  category: string;
  date_collected: string;
}

// Create a parser instance with custom fields
const parser = new Parser({
  customFields: {
    item: [
      ['description', 'summary'],
      ['category', 'category']
    ]
  }
});

/**
 * Fetches and parses the Phys.org RSS feed
 */
async function getPhysOrgLatestNews(): Promise<NewsItem[]> {
  try {
    // Use Phys.org's RSS feed
    const feed_url = "https://phys.org/rss-feed/";
    
    // Parse the feed
    const feed = await parser.parseURL(feed_url);
    
    // Create a list to store news data
    const latestNews: NewsItem[] = [];
    
    // Process each entry in the feed
    for (const entry of feed.items) {
      // Extract category if available or default to "Uncategorized"
      const category = entry.category || "Uncategorized";
      
      // Format the published date
      let formattedDate = entry.pubDate || new Date().toISOString();
      try {
        if (entry.pubDate) {
          const pubDate = new Date(entry.pubDate);
          formattedDate = pubDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        console.error(`Date parsing error: ${e}`);
      }
      
      // Add the entry to our news list
      latestNews.push({
        title: entry.title || "Untitled",
        link: entry.link || "#",
        summary: entry.summary || "",
        published: formattedDate,
        category: category,
        date_collected: new Date().toISOString()
      });
    }
    
    return latestNews;
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Get latest news from Phys.org RSS feed
    const latestNews = await getPhysOrgLatestNews();
    
    // Return the news data
    return NextResponse.json(latestNews);
  } catch (error) {
    console.error("Error in research-news API route:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch research news from Phys.org" },
      { status: 500 }
    );
  }
}