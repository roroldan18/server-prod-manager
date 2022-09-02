require('dotenv').config({silent: true})

let variables_entorno = {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST as string,
    DB_USERNAME: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_PORT: parseInt(process.env.DB_PORT as string),
    DB_MYSQL: process.env.DB_MYSQL as string
}

export default variables_entorno;