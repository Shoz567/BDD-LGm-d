import GestionCataloguePage from '@/app/gestion/catalogue/page';

export default async function CatalogueComptoir(props: Parameters<typeof GestionCataloguePage>[0]) {
  return GestionCataloguePage({ ...props, basePath: '/catalogue', mode: 'comptoir' });
}
