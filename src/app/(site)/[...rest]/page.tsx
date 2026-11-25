import { notFoundOrRedirect } from "@/server/route-helpers";

// Endereços que nenhuma rota reconhece: tenta um redirecionamento cadastrado, senão 404.
export default async function CatchAll({ params }: PageProps<"/[...rest]">) {
  const { rest } = await params;
  await notFoundOrRedirect(`/${rest.join("/")}/`);
}
