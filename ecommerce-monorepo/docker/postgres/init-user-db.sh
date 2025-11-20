set -e
create_db_and_user() {
    local database=$1
    local user=$2
    local password=$3

    echo "  Creating user and database '$database' with user '$user'..."
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE USER $user WITH PASSWORD '$password';
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $user;
        ALTER DATABASE $database OWNER TO $user;
EOSQL
}

# 1. Create Identity DB
if [ -n "$IDENTITY_DB_USER" ] && [ -n "$IDENTITY_DB_PASS" ]; then
    create_db_and_user $IDENTITY_DB_NAME $IDENTITY_DB_USER $IDENTITY_DB_PASS
fi

# 2. Create Orders DB
if [ -n "$ORDERS_DB_USER" ] && [ -n "$ORDERS_DB_PASS" ]; then
    create_db_and_user $ORDERS_DB_NAME $ORDERS_DB_USER $ORDERS_DB_PASS
fi

# 3. Create Catalog DB
if [ -n "$CATALOG_DB_USER" ] && [ -n "$CATALOG_DB_PASS" ]; then
    create_db_and_user $CATALOG_DB_NAME $CATALOG_DB_USER $CATALOG_DB_PASS
fi