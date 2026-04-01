-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  nom text not null,
  description text,
  categorie text,
  prix_ttc numeric,
  base_lppr numeric,
  image_url text,
  embedding vector(1024) -- Mistral Embed uses 1024 dimensions
);

-- Create a generic function to search products by embedding
create or replace function search_products (
  query_embedding vector(1024),
  match_count int DEFAULT 5,
  filter_categories text[] DEFAULT '{}'
) returns table (
  id uuid,
  reference text,
  nom text,
  description text,
  categorie text,
  prix_ttc numeric,
  base_lppr numeric,
  image_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    products.id,
    products.reference,
    products.nom,
    products.description,
    products.categorie,
    products.prix_ttc,
    products.base_lppr,
    products.image_url,
    1 - (products.embedding <=> query_embedding) as similarity
  from products
  where array_length(filter_categories, 1) is null 
     or products.categorie = any(filter_categories)
  order by products.embedding <=> query_embedding
  limit match_count;
end;
$$;
