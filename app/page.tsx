import { getSettings, getPageById } from '../lib/wp';
import DesignedHomepage from '../components/DesignedHomepage';

export default async function Home() {
  const settings = await getSettings();

  if (!settings?.page_on_front) {
    return <h1>WordPress Front Page not configured</h1>;
  }

  const page = await getPageById(settings.page_on_front);

  if (!page || !page.acf) {
    return <h1>ACF data missing on homepage</h1>;
  }

  return <DesignedHomepage page={page} />;
}