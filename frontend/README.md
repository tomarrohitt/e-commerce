# E-Commerce Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## 🚀 Getting Started

First, install the dependency packages for the server:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

The run the development service:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

> **💡 Hot Reload:** You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## 🎨 Font Optimization

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🔗 Backend Integration

This frontend connects to the microservices backend. Make sure the backend services are running before starting the frontend.

> **📝 Note:** The API Gateway should be accessible at the configured endpoint in your environment variables.

### Environment Variables

Rename the `.env.example` to `.env.local` file in the /frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> **⚠️ Important:** Adjust the API URL based on your backend configuration.
