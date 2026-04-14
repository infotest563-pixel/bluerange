import { redirect } from 'next/navigation';

export default function SwedishHomePage() {
    // Redirect /sv/home to /sv
    redirect('/sv');
}
