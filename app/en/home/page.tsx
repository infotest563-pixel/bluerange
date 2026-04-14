import { redirect } from 'next/navigation';

export default function EnglishHomePage() {
    // Redirect /en/home to /
    redirect('/');
}
