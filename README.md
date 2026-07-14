# Fake E-Commerce (Next.js + Tailwind)

A small e-commerce demo built with Next.js App Router, React, and Tailwind CSS. It lists products from [FakeStoreAPI](https://fakestoreapi.com), lets you view product details, and add items to a persistent cart.

## Purpose

This is a learning project. It's part of a bootcamp roadmap focused on React/Next.js fundamentals as a stepping stone toward .NET/ASP.NET backend development. The goal is to practice App Router conventions, server vs. client components, data fetching, and state management (Context API) by building a real, working feature end to end rather than a toy example.

## Features

- Product listing (`/`) — fetches all products from FakeStoreAPI and renders them in a responsive grid
- Product detail page (`/products/[id]`) — dynamic route showing a single product
- Cart (`/cart`) — add/remove items, adjust quantities, view totals; cart state is kept in React Context and persisted to `localStorage`
- Shared `Nav` (with live cart count badge) and `Footer` via the root layout

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- Tailwind CSS 4
- [FakeStoreAPI](https://fakestoreapi.com) as the data source

## Project structure

```
src/
  app/
    layout.jsx              # Root layout: wraps every page with Nav, Footer, CartProvider
    page.jsx                 # "/" — product listing
    products/[id]/page.jsx   # "/products/:id" — product detail
    cart/page.jsx            # "/cart" — cart page
    users/page.jsx           # "/users" — placeholder page
  components/
    Nav.jsx                  # Top navigation, with cart count badge
    Footer.jsx                # Footer
    AddToCartButton.jsx       # "Add to cart" button
  context/
    CartContext.jsx           # Cart state (add/remove/update, localStorage persistence)
  lib/
    api.js                    # FakeStoreAPI fetch helpers
next.config.mjs               # Next.js config (remote image domain, React Compiler)
```

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the project
```

## Notes

- Images are loaded from `fakestoreapi.com`, which is allow-listed in `next.config.mjs` under `images.remotePatterns`.
- Checkout is currently a visual-only button — no real payment flow is wired up yet.
- See `OGRENME-REHBERI.md` for a detailed (Turkish) walkthrough of how the project was built, key concepts, and mistakes made along the way — written as a personal learning log.

## Possible next steps

- Real checkout flow
- Loading states (`loading.jsx`)
- Product search/filtering by category
- Authentication, to give the `/users` page real functionality