FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    libssl-dev \
    libpq-dev \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# Match the project name from CMakeLists.txt (portfolio)
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release
RUN cmake --build build --config Release --parallel $(nproc)

# Strip the 'portfolio' binary
RUN strip --strip-all build/portfolio

# --- Runtime Stage ---
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libssl3 \
    libpq5 \
    libmariadb3 \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary and the public folder (required for static_files)
COPY --from=builder /app/build/portfolio ./server
COPY --from=builder /app/public ./public

RUN useradd -m blaze
USER blaze

EXPOSE 8080

ENTRYPOINT ["./server"]
