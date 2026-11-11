import { ApiKeyListPage } from "@/features/platform/api-keys/screens/ApiKeyListPage";

import { gatePlatformPage } from '@/features/dashboard/lib/platformGate';

function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ApiKeyListPage searchParams={searchParams} />;
}
export default gatePlatformPage('api-keys', Page);
