import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client'

export type ClaimrClientOptions = {
  apiKey: string
}

export class ClaimrClient {
  public apolloClient: ApolloClient<NormalizedCacheObject>

  constructor(options: ClaimrClientOptions) {
    const { apiKey } = options

    this.apolloClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: 'https://api.claimr.tools/graphql',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
    })
  }
}
