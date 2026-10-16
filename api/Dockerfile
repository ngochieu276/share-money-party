FROM denoland/deno:2.9.6

WORKDIR /app

COPY . .

ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN deno install && deno task db:generate

EXPOSE 8080

CMD ["deno", "run", "-A", "main.ts"]
