# Etapa 1: build
FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:buster-slim
WORKDIR /app
COPY --from=builder /app/target/release/backend /app/backend
EXPOSE 8000
CMD ["./backend"]