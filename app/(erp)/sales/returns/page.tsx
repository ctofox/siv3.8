'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/sales" className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-2xl font-bold">Sales Returns</h1><p className="text-muted-foreground text-sm">Process product returns and refunds</p></div>
      </div>
      <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
        <p className="text-4xl mb-3">↩️</p>
        <h3 className="text-base font-semibold text-foreground mb-1">Returns Management</h3>
        <p className="text-sm text-muted-foreground">Process returns by selecting an invoice from the Sales module and clicking Return.</p>
        <Link href="/sales" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Go to Sales</Link>
      </div>
    </div>
  );
}
