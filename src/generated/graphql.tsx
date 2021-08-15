import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
const defaultOptions = {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

/** Defines an area, effectively a polygon of locations. */
export type Area = {
  __typename?: 'Area'
  locations: Array<Location>
}

/** Defines an area. */
export type AreaInput = {
  /** One or more locations which indicate the bounding box of this area. */
  locations: Array<LocationInput>
}

/** The claim which was granted to the user. */
export type Claim = {
  __typename?: 'Claim'
  /** The area which the user's location should be in. */
  area?: Maybe<Area>
  /** The point to which the user's location was sufficiently close. */
  point?: Maybe<Point>
}

/**
 * Allows constructing claims. Claims are requirements imposed on a users' location. Only when all claims
 * are met will a token be granted.
 */
export type ClaimInput = {
  /** Requires the user to be inside this area for the claim to be granted. */
  area?: Maybe<AreaInput>
  /** Requires the user to be sufficiently close to the given point for the claim to be granted. */
  point?: Maybe<PointInput>
}

/** The context in which the request was made. This acts as the proof for this request. */
export type ContextInput = {
  /**
   * RAW GNSS data formatted according to Google's
   * [GNSSLogger](https://github.com/google/gps-measurement-tools/tree/master/GNSSLogger). Requires the entire
   * log file, including headers, as one long string.
   */
  gnssLog: Scalars['String']
}

/** Defines a geographical location using coordinates. */
export type Location = {
  __typename?: 'Location'
  /** The latitude of this location. */
  latitude: Scalars['Float']
  /** The longitude of this location. */
  longitude: Scalars['Float']
}

/** Defines a geographical location using coordinates. */
export type LocationInput = {
  /** The latitude of this location. */
  latitude: Scalars['Float']
  /** The longitude of this location. */
  longitude: Scalars['Float']
}

/** Defines a point with a certain radius. */
export type Point = {
  __typename?: 'Point'
  /** The center of this point. */
  location: Location
  /** The radius around this location in meters. */
  radius: Scalars['Float']
}

/** Defines a point claim. */
export type PointInput = {
  /** The location of this point. */
  location: LocationInput
  /** The radius of this point to be included in meters. */
  radius: Scalars['Float']
}

/** The type of proof used to validate this claim. */
export enum ProofTypes {
  /** RAW GNSS measurement data was used to verify the claim. */
  Gnss = 'GNSS',
}

export type Query = {
  __typename?: 'Query'
  /**
   * Verify a user's location by providing the token (where we expect our user to be) and context (acts as
   * proof).
   */
  verifyLocation: VerifiedLocationResponse
}

export type QueryVerifyLocationArgs = {
  tokenRequest: TokenRequestInput
  context: ContextInput
  logRequestDetails?: Scalars['Boolean']
}

/** The status of the claim request. */
export enum Status {
  /** The claims were successfully verified and granted. */
  Granted = 'GRANTED',
  /**
   * The user's request was successfully received and processed, however it was deemed insufficient proof to
   * grant the claim.
   */
  Revoked = 'REVOKED',
  /**
   * The request could not be handled. This can have multiple causes, for example the claim did not satisfy the
   * required format or the GNSS data could not be resolved to a location.
   */
  Error = 'ERROR',
}

/** Defines the fields which a token can have. */
export type Token = {
  __typename?: 'Token'
  /** Subject of the JWT (the user). */
  sub?: Maybe<Scalars['String']>
  /** Time at which the JWT was issued (Issued At Time); can be used to determine age of the JWT. */
  iat: Scalars['Int']
  /** The claim the user requested. */
  claim: Claim
  /** The source of truth used by the user to proof their claim. */
  proof: ProofTypes
}

export type TokenRequestInput = {
  /** Subject of the JWT (the user). */
  sub?: Maybe<Scalars['String']>
  /** The requested set of claims which are requested in this token. */
  claim: ClaimInput
}

/** Exposes a granted claim as a token, both in GraphQL queryable format and as a JWT. */
export type TokenResponse = {
  __typename?: 'TokenResponse'
  /** The token containing all claims which the service has granted on this request. */
  token: Token
  /**
   * The token encoded and signed as a JWT. This JWT can be used to proof to a third-party that you
   * were granted these claims.
   */
  jwt: Scalars['String']
  /**
   * JSON encoded version of the provisioned claim token.
   *
   * ___DEVELOPMENT ONLY:__ This field merely exists for development purposes, as such this field might
   * be changed in future versions. Instead decode the content of the \`jwt\` field to get the JSON
   * encoding of the supplied token._
   */
  tokenAsJson?: Maybe<Scalars['String']>
}

/**
 * The response for a location verification requests. Contains status details and potentially the granted
 * claims if the location was successfully verified.
 */
export type VerifiedLocationResponse = {
  __typename?: 'VerifiedLocationResponse'
  /** A token containing the claims which were granted. This field will only exist when status is \`SUCCESS\`. */
  tokenResponse?: Maybe<TokenResponse>
  /** The status of this verified location response. */
  status: Status
  /**
   * An optional message for this verified location response, mostly used to communicate the reason why a
   * request was revoked or caused an error.
   */
  message?: Maybe<Scalars['String']>
}

export type VerifyLocationQueryVariables = Exact<{
  claim: ClaimInput
  context: ContextInput
  logRequestDetails?: Maybe<Scalars['Boolean']>
}>

export type VerifyLocationQuery = {
  __typename?: 'Query'
  verifyLocation: {
    __typename?: 'VerifiedLocationResponse'
    status: Status
    message?: Maybe<string>
    tokenResponse?: Maybe<{
      __typename?: 'TokenResponse'
      jwt: string
      token: {
        __typename?: 'Token'
        claim: {
          __typename?: 'Claim'
          point?: Maybe<{
            __typename?: 'Point'
            radius: number
            location: { __typename?: 'Location'; latitude: number; longitude: number }
          }>
        }
      }
    }>
  }
}

export const VerifyLocationDocument = gql`
  query VerifyLocation($claim: ClaimInput!, $context: ContextInput!, $logRequestDetails: Boolean) {
    verifyLocation(
      tokenRequest: { claim: $claim }
      context: $context
      logRequestDetails: $logRequestDetails
    ) {
      status
      message
      tokenResponse {
        token {
          claim {
            point {
              location {
                latitude
                longitude
              }
              radius
            }
          }
        }
        jwt
      }
    }
  }
`

/**
 * __useVerifyLocationQuery__
 *
 * To run a query within a React component, call `useVerifyLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useVerifyLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVerifyLocationQuery({
 *   variables: {
 *      claim: // value for 'claim'
 *      context: // value for 'context'
 *      logRequestDetails: // value for 'logRequestDetails'
 *   },
 * });
 */
export function useVerifyLocationQuery(
  baseOptions: Apollo.QueryHookOptions<VerifyLocationQuery, VerifyLocationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<VerifyLocationQuery, VerifyLocationQueryVariables>(VerifyLocationDocument, options)
}
export function useVerifyLocationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<VerifyLocationQuery, VerifyLocationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<VerifyLocationQuery, VerifyLocationQueryVariables>(
    VerifyLocationDocument,
    options
  )
}
export type VerifyLocationQueryHookResult = ReturnType<typeof useVerifyLocationQuery>
export type VerifyLocationLazyQueryHookResult = ReturnType<typeof useVerifyLocationLazyQuery>
export type VerifyLocationQueryResult = Apollo.QueryResult<VerifyLocationQuery, VerifyLocationQueryVariables>
