import http from 'http';
import {
	CLIENT_URL,
	NODE_ENV,
	PORT,
	SECERT_KEY_ONE,
	SECERT_KEY_TWO,
} from './config';
import cors from 'cors';
import {
	Express,
	Request,
	Response,
	NextFunction,
	json,
	urlencoded,
} from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { expressMiddleware } from '@apollo/server/express4';
import cookieSession from 'cookie-session';
import logger from './logger';
import { GraphQLSchema } from 'graphql';
import { mergeGraphQLSchema } from '@app/graphql/schema';
import { resolvers } from '@app/graphql/resolvers';

export interface AppContext {
	req: Request;
	res: Response;
}

export default class MonitorServer {
	private app: Express;
	private httpServer: http.Server;
	private server: ApolloServer;

	constructor(app: Express) {
		this.app = app;
		this.httpServer = new http.Server(this.app);

		// Builds a schema from the provided type definitions and resolvers.
		const schema: GraphQLSchema = makeExecutableSchema({
			typeDefs: mergeGraphQLSchema,
			resolvers: resolvers,
		});
		this.server = new ApolloServer<AppContext | BaseContext>({
			schema,
			introspection: NODE_ENV !== 'production',
			plugins: [
				ApolloServerPluginDrainHttpServer({
					httpServer: this.httpServer,
				}),
				NODE_ENV === 'production'
					? ApolloServerPluginLandingPageDisabled()
					: ApolloServerPluginLandingPageLocalDefault({
							embed: true,
						}),
			],
		});
	}

	async start() {
		// NOTE - Need to Start APOLLO Server FIRST BEFORE SENDING IT TO THE MIDDLEWARE
		await this.server.start();

		this.standardMiddleware(this.app);
		this.startServer();
	}

	private standardMiddleware(app: Express): void {
		app.set('trust proxy', 1);

		app.use((_: Request, res: Response, next: NextFunction) => {
			res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
			next();
		});

		app.use(
			cookieSession({
				name: 'session',
				keys: [SECERT_KEY_ONE, SECERT_KEY_TWO],
				maxAge: 24 * 7 * 3600 * 1000, // 7 days
				secure: NODE_ENV !== 'development',
				...(NODE_ENV !== 'development' && { sameSite: 'none' }),
			})
		);
		// MOUNTING THE GRAPHQL ROUTE
		this.graphQLRoute(app);

		this.healthRoute(app);
	}

	private healthRoute(app: Express) {
		app.get('/health', (_: Request, res: Response) => {
			res.status(200).send('Uptimer Monitor is Healthy.');
		});
	}

	private graphQLRoute(app: Express) {
		app.use(
			'/graphql',
			cors({
				origin: CLIENT_URL,
				credentials: true,
			}),
			json({ limit: '200mb' }),
			urlencoded({ extended: true, limit: '200mb' }),

			// enables you to attach Apollo Server to an Express server.
			expressMiddleware(
				this.server,
				// GETTING ACCESS OF REQUEST AND RESPONSE
				{
					context: async ({
						req,
						res,
					}: {
						req: Request;
						res: Response;
					}) => ({
						req,
						res,
					}),
				}
			)
		);
	}

	private async startServer(): Promise<void> {
		try {
			const SERVER_PORT: number = parseInt(PORT!, 10) || 5000;

			logger.info(
				`Starting server on port: ${SERVER_PORT}, with process id: ${process.pid}`
			);

			this.httpServer.listen(SERVER_PORT, () => {
				logger.info(
					`Server is running at http://localhost:${SERVER_PORT}`
				);
			});
		} catch (error) {
			logger.error('Error starting server:', error);
		}
	}
}
