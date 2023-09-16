# Lens Protocol Explorer

## Lens Protocol

Lens. Protocol. The Social Layer for Web3. It is a decentralized, open-source protocol that creates a new paradigm for network effects. The social layer is the future of social media.

Links:
- [🌿 Lens Protocol Docs](https://docs.lens.xyz/docs)
  - [Deployed Contract Addresses](https://docs.lens.xyz/docs/deployed-contract-addresses)
  - [Events](https://docs.lens.xyz/docs/events)
- [Polygonscan]()
  - [Lens Profile Token Tracker](https://polygonscan.com/token/0xdb46d1dc155634fbc732f92e853b10b288ad5a1d)
  - [Lens Contract Address](https://polygonscan.com/address/0xdb46d1dc155634fbc732f92e853b10b288ad5a1d)

## Squid

Links:
 - [🦑 GraphQL API](https://squid.subsquid.io/lens-protocol-explorer/v/v2/graphql)

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

## Example queries

Last 10 publications

```gql
query {
  publications(limit: 10, orderBy: ref_timestamp_DESC) {
    ref {
      variant
      timestamp
      creator {
        handle
      }
    }
    ... on Post {
      id
      contentUri
    }
    ... on Mirror {
      id
      mirroredCreator {
        handle
      }
      mirroredPublication {
        id
        variant
      }
    }
    ... on Comment {
      id
      commentedCreator {
        handle
      }
      commentedPublication {
        id
        variant
      }
      contentUri
    }
  }
}
```

All Profile Transfers for user with ID `1862`

```gql
query {
  profileTransfers(where: {profile: {id_eq: "1862"}}, limit: 10) {
    id
    profile {
      address
    }
    from
    to
    txHash
    timestamp
  }
}
```

All Profile Image updates for use with ID `1862`

```gql
query {
  profileImageUpdates(limit: 10, where: {profile: {id_eq: "1862"}}) {
    id
    oldImageUri
    newImageUri
    txHash
    timestamp
  }
}
```