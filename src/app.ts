import express, { Express } from 'express';
import MonitorServer from './server/server';
import { connectDB } from './server/database';

const initialiseApp = (): void => {
	const app: Express = express();

	const monitorServer = new MonitorServer(app);
	monitorServer.start();

	connectDB();
};

initialiseApp();
