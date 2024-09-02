import { buildSchema } from 'graphql';

// Builds a GraphQLSchema directly from a source document
export const userSchema = buildSchema(`#graphql
    # DATA SENT FROM CLIENT TO SERVER
    input Auth{
        username: String
        email: String
        password: String
        socialId: String
        type: String
    }
    
    # DATA SENT FROM SERVER TO CLIENT
    type User{
        id: Int
        username: String
        email: String
        createdAt: String
        googleId: String
        facebookId: String
    }

    type NotificationResult{
        id: ID!
        userId: String!
        groupName: String!
        email: String!
    }

    type AuthResponse{
        user: User
        notification:  [NotificationResult!]!  # Non Nullable Value
    }

    type AuthLogoutResponse{
        message: String
    }

    type CheckCurrentResponse{
        user: User
        notification: [NotificationResult!]
    }

    type Query{
        checkCurrentUser: CheckCurrentResponse
    }

    type Mutation{
        loginUser(username: String!, password: String!): AuthResponse!
        registerUser(user: Auth!) : AuthResponse!
        authSocialUser(user: Auth!) : AuthResponse!
        logout: AuthLogoutResponse!
    }
`);
