import { Sequelize } from 'sequelize';
import variables_entorno from '../../config';

export const db = new Sequelize(
	variables_entorno.DB_MYSQL,
	variables_entorno.DB_USERNAME,
	variables_entorno.DB_PASSWORD,
	{
		host: variables_entorno.DB_HOST,
		port: variables_entorno.DB_PORT,
		logging: console.log,
		pool:{
			max:5,
			idle:30
		},
		dialect: 'mysql',
		dialectOptions: {
			ssl:'Amazon RDS'
			},
	}
)

export const dbConnection = async ()  => {
	try {
			await db.authenticate();
			console.log('Application connected to Amazon RDS')
	} catch (error:any) {
			throw new Error ( error );
	}
}


export default db;


