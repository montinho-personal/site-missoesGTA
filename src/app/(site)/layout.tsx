import { Consent, Header } from "@/components/Chrome";
import { Footer } from "@/components/Footer";
import { getCategories } from "@/server/content";
import { saleConfig } from "@/server/mercadopago";
import { StickyAppBar } from "@/components/StickyAppBar";
import { appSecretCount } from "@/server/app-count";

export const revalidate = 600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, sale, secrets] = await Promise.all([getCategories(), saleConfig(), appSecretCount()]);
  return (
    <>
      <a href="#conteudo" className="sr-only-focusable fixed left-3 top-3 z-[60] btn btn-primary btn-sm">Pular para o conteúdo</a>
      <Header secrets={secrets} />
      <main id="conteudo" tabIndex={-1} className="grow outline-none">{children}</main>
      <Footer categories={categories} />
      <StickyAppBar saleEnabled={sale.enabled} priceLabel={sale.priceLabel} secrets={secrets} />
      <Consent />
    </>
  );
}
