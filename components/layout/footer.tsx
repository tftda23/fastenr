import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-gray-400">
              The AI-powered customer success platform that helps you reduce churn and drive growth.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/dashboard/analytics" className="hover:text-white">Analytics</Link></li>
              <li><Link href="/dashboard/health" className="hover:text-white">Health Scores</Link></li>
              <li><Link href="/dashboard/ai-insights" className="hover:text-white">AI Insights</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/support" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/documentation" className="hover:text-white">Documentation</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Fastenr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}