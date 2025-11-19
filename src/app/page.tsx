import { redirect } from 'next/navigation';

export default function HomePage() {
  // Server-side redirect to dashboard for authenticated users or login for unauthenticated
  redirect('/dashboard');
}
