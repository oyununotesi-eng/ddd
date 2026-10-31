<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ea575924-f300-4275-a262-844f7b3d9cdd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app and Workspace API together:
   `npm run dev`

The Workspace API serves the SSL certificate tools. Release Tracker reads its product, source, and release data from JSON files under `src/data/releases`; it does not call a release API or scrape vendor sites at runtime.
