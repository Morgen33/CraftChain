import Link from 'next/link';
import WalletConnect from './WalletConnect';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Craft Chain
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/products/create" className="text-gray-700 hover:text-blue-600">
              Sell
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}

