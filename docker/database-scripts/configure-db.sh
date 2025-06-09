#!/bin/bash

TIMEOUT=240
# Wait TIMEOUT seconds for SQL Server to start up by ensuring that
# calling SQLCMD does not return an error code, which will ensure that sqlcmd is accessible
# and that system and user databases return "0" which means all databases are in an "online" state
# https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-databases-transact-sql?view=sql-server-2017

DBSTATUS=1
ERRCODE=1
i=0

while ([[ $ERRCODE -ne 0 ]] || [[ $DBSTATUS -ne 0 ]]) && [[ $i -lt $TIMEOUT ]]; do
  let i=$i+1
  DBSTATUS=$(/opt/sqlcmd/sqlcmd -h -1 -t 1 -U sa -P "$MSSQL_SA_PASSWORD" -Q "SET NOCOUNT ON; Select SUM(state) from sys.databases")
  ERRCODE=$?
  if [ -z "$DBSTATUS" ]; then
    DBSTATUS=1
  fi
  sleep 1
done

if [[ $DBSTATUS -ne 0 ]] || [[ $ERRCODE -ne 0 ]]; then
  echo "SQL Server took more than 60 seconds to start up or one or more databases are not in an ONLINE state"
  exit 1
fi

# Run the setup script to create the DB and the schema in the DB
echo "Creating database..."
/opt/sqlcmd/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i db-init.sql

for script in ./sql/*.sql; do
  echo "[configure-db] Running $script..."
  /opt/sqlcmd/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d wise-geoguessr -i "$script"
done

# for seed_file in ./seed-files/*.sql ; do
#   echo "[seed-db] Running $seed_file..."
#   /opt/sqlcmd/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d wise-geoguessr -i "$seed_file"
# done

echo "Database setup completed!"
