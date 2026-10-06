# Indigo Row (Shopify Online Store 2.0 theme)

Lightweight OS 2.0 theme: JSON templates, sections with schema, AJAX add-to-cart, variant picker with media switching, collection sorting and pagination, accessible by default.

## Run it
    npm i -g @shopify/cli
    shopify theme dev --store your-store.myshopify.com
    shopify theme check

Or zip the folder and upload it under Online Store > Themes > Add theme.

## Structure
layout/theme.liquid, templates/*.json, sections/ (header, footer, hero, featured-collection, main-product, main-collection, main-cart, main-search, main-page, main-404), snippets/product-card.liquid, assets/theme.css and theme.js, config/settings_schema.json (colors).

Includes an AJAX cart drawer (native dialog + Section Rendering API) and font pickers (Shopify CDN fonts). Not included: customer account templates (use new customer accounts), predictive search.
