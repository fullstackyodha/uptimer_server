import { Sequelize } from 'sequelize';
import { POSTGRES_DB } from './config';

export const sequelize: Sequelize = new Sequelize(POSTGRES_DB, {
	// host: 'localhost',
	// port: 5432,
	dialect: 'postgres',
	logging: false,
	dialectOptions: {
		multipleStatements: true,
	},
	define: {
		timestamps: false,
	},
});

export async function connectDB(): Promise<void> {
	try {
		// Test the connection by trying to authenticate
		await sequelize.authenticate();
		// Sync all defined models to the DB.
		await sequelize.sync();

		console.log('Connected to the Database Successfully...');
	} catch (err) {
		console.log(err);
	}
}
