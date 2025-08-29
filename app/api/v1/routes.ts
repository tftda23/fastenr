import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathname = req.url!

  if (pathname === '/api/v1/routes') {
    res.status(200).json([
      // ... other routes
      {
        path: '/dashboard/admin/billing',
        component: 'BillingPage',
        isPrivate: true,
        isAdmin: true,
      },
      // ... other routes
    ])
  } else if (pathname === '/api/v1/routes/:route') {
    const route = req.query.route as string

    res.status(200).json([
      // ... other routes
      {
        path: `/dashboard/${route}`,
        component: () => import(`../pages/dashboard/${route}`),
        isPrivate: true,
      },
      // ... other routes
    ])
  } else {
    res.status(404).json({ error: 'Route not found' })
  }
}
