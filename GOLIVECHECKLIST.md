# KNL Atelier & Co. — Go-Live Checklist

Run through every item before pointing your domain to production.
Check off each item as you complete it.

---

## 🔧 Backend (Laravel API)

### Server Setup
- [ ] Ubuntu 22.04 server provisioned on Laravel Forge
- [ ] MySQL 8 database created: `knl_atelier_prod`
- [ ] Redis installed and running (`redis-cli ping` returns PONG)
- [ ] Supervisor installed and queue workers running (3 processes)
- [ ] PHP 8.3 with extensions: gd, imagick, zip, intl, redis

### Environment
- [ ] `.env` created from `.env.production.example`
- [ ] `APP_ENV=production` and `APP_DEBUG=false`
- [ ] `APP_KEY` generated: `php artisan key:generate`
- [ ] `JWT_SECRET` generated: `php artisan jwt:secret`
- [ ] `DB_*` values filled in and connection tested
- [ ] `MAIL_*` values filled in — send a test email
- [ ] `CLOUDINARY_*` values filled in — test an image upload
- [ ] `CORS_ALLOWED_ORIGINS` set to your exact frontend domain

### Database
- [ ] Migrations run: `php artisan migrate --force`
- [ ] Seeder run: `php artisan db:seed --force`
- [ ] Admin account exists: `admin@knlatelier.com`
- [ ] Demo coupons seeded: WELCOME10, KNL500, SEIKO20
- [ ] Verify login works: `POST /api/auth/login`

### Laravel Caches
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `php artisan storage:link`

### Security
- [ ] `APP_DEBUG=false` (verified in browser — no stack traces)
- [ ] SSL certificate installed (HTTPS working, HTTP redirects)
- [ ] SecurityHeaders middleware added to `bootstrap/app.php`
- [ ] Rate limiting confirmed on `/api/auth/login`
- [ ] `/api/admin/*` returns 401 without a valid admin JWT
- [ ] Admin panel URL is not obvious (consider `/knl-admin/login`)

### Queue Workers
- [ ] Supervisor running: `sudo supervisorctl status`
- [ ] Send a test order — confirm confirmation email received
- [ ] Check queue logs: `tail -f /var/log/supervisor/knl-worker.log`

---

## 🌐 Frontend (Next.js on Vercel)

### Vercel Setup
- [ ] Project connected to GitHub repository
- [ ] All `NEXT_PUBLIC_*` env variables set in Vercel dashboard
- [ ] Production domain added: `knlatelier.com`
- [ ] `www.knlatelier.com` redirects to `knlatelier.com`
- [ ] Build succeeds with zero TypeScript errors

### DNS
- [ ] `knlatelier.com` A record → Vercel IP (or CNAME → cname.vercel-dns.com)
- [ ] `api.knlatelier.com` A record → your server IP
- [ ] SSL certificates issued for both domains (Vercel handles frontend)
- [ ] Propagation verified: `dig knlatelier.com A`

### Assets
- [ ] `/public/og-default.jpg` uploaded (1200×630px for social sharing)
- [ ] `/public/favicon.ico` and `/public/icon.png` uploaded
- [ ] `/public/apple-icon.png` uploaded (180×180px)
- [ ] `/public/logo.png` uploaded (used in JSON-LD schema)

### SEO
- [ ] `https://knlatelier.com/sitemap.xml` loads correctly
- [ ] `https://knlatelier.com/robots.txt` loads correctly
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Check Open Graph preview: https://www.opengraph.xyz/?url=https://knlatelier.com

### Analytics
- [ ] GA4 Measurement ID set in env — verify events firing in GA4 DebugView
- [ ] Facebook Pixel ID set — verify in Facebook Pixel Helper browser extension
- [ ] Test add-to-cart event tracked in both GA4 and Facebook
- [ ] Test purchase event tracked after placing a test order

---

## 🛒 Store Functionality

### Customer Journey
- [ ] Homepage loads and hero section renders
- [ ] Shop page loads products from the Laravel API
- [ ] Product detail page loads with correct specs and price
- [ ] Add to cart works — cart count in header updates
- [ ] Coupon WELCOME10 applies 10% discount correctly
- [ ] Checkout form validates all steps before proceeding
- [ ] GCash payment flow: reference number saved to payments table
- [ ] COD payment flow: order placed with pending status
- [ ] Order success page shows correct order number
- [ ] Order confirmation email received within 60 seconds

### Admin Panel
- [ ] `/admin/login` accessible
- [ ] Customer account credentials CANNOT log in to admin
- [ ] Admin account can log in and see dashboard
- [ ] Dashboard shows revenue/order counts from the DB
- [ ] Products CRUD: create, edit, delete all work
- [ ] Orders: status update to "confirmed" sends email
- [ ] Payments: verify a GCash payment → order status updates
- [ ] CSV export downloads a valid file
- [ ] PDF invoice generates and downloads

### Edge Cases
- [ ] Out-of-stock product cannot be added to cart via API
- [ ] Expired coupon returns an error message
- [ ] Invalid JWT token returns 401 (not 500)
- [ ] Non-admin JWT returns 403 on admin routes
- [ ] All 404 pages show the custom not-found.tsx page
- [ ] Mobile layout tested at 375px width

---

## 📊 Performance

### Core Web Vitals (target thresholds)
- [ ] LCP (Largest Contentful Paint) < 2.5 seconds
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Test with: https://pagespeed.web.dev/?url=https://knlatelier.com

### API Response Times
- [ ] `GET /api/products` < 300ms
- [ ] `GET /api/admin/dashboard` < 500ms
- [ ] `POST /api/orders` < 1000ms (DB transaction + event dispatch)

---

## 🔒 Final Security Review

- [ ] No real credentials in any committed files
- [ ] `.env` is in `.gitignore` on both repos
- [ ] `APP_DEBUG=false` confirmed
- [ ] Cloudinary API Secret is server-only (never in NEXT_PUBLIC_ vars)
- [ ] Database user has only SELECT/INSERT/UPDATE/DELETE — no DROP/ALTER
- [ ] Consider setting up Cloudflare in front of Vercel for DDoS protection

---

## 🎉 Launch

- [ ] Announce on Facebook Page: KNL Atelier & Co.
- [ ] Announce on Instagram: @knlatelier
- [ ] Place one real test order and verify the full flow end-to-end
- [ ] Monitor GA4 Realtime for the first hour after launch

**You're live. Congratulations! 🚀**
