# Lens Protocol Analytics

## Lens Protocol

Lens. Protocol. The Social Layer for Web3. It is a decentralized, open-source protocol that creates a new paradigm for network effects. The social layer is the future of social media.

Links:
 - [🌿 Lens Protocol Docs](https://docs.lens.xyz/docs)
 - [Deployed Contract Addresses](https://docs.lens.xyz/docs/deployed-contract-addresses)

## Squid

Links:
 - [🦑 GraphQL API](https://squid.subsquid.io/lens-protocol-analytics/v/v5/graphql)

## Usage

0. Install the [Squid CLI](https://docs.subsquid.io/squid-cli/):

    ```sh
    npm i -g @subsquid/cli
    ```

1. Build and run the squid

    ```bash
    sqd build
    sqd up
    sqd migration:generate
    sqd process
    ```
    The indexing will start.

    In a separate window, start the GraphQL API server at `localhost:4350/graphql`:
    ```bash
    sqd serve
    ```

    For more details on how to build and deploy a squid, see the [docs](https://docs.subsquid.io).

