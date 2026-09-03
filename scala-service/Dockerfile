FROM eclipse-temurin:17-jdk

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fL https://github.com/VirtusLab/scala-cli/releases/download/v1.9.1/scala-cli-x86_64-pc-linux.tar.gz \
    -o /tmp/scala-cli.tar.gz && \
    tar -xzf /tmp/scala-cli.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/scala-cli && \
    rm /tmp/scala-cli.tar.gz

COPY src ./src

CMD ["scala-cli", "run", "src/MetadataProcessor.scala", "--server=false"]