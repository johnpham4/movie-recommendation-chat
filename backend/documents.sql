create table movies (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(1024), -- for langchain cohere embedding 
  thumbnail text
);

drop table movies;

DROP FUNCTION match_movies(vector,double precision,integer);

create or replace function match_movies (
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  thumbnail text,
  similarity float
)
language sql stable
as $$
  select    
    movies.id,
    movies.content,
    movies.thumbnail,
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

