import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client'

export type UnveilerClientOptions = {
  apiKey: string
}

export class UnveilerClient {
  public apolloClient: ApolloClient<NormalizedCacheObject>

  constructor({ apiKey }: UnveilerClientOptions) {
    this.apolloClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: 'https://api.unveiler.io/graphql',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
    })
  }
}
