#!/bin/sh
set -euo pipefail

ENVIRONMENT_FILE="/srv/environment.json"

# Create the environment file if missing
if [ ! -f "${ENVIRONMENT_FILE}" ]
then
    echo '{}' > "${ENVIRONMENT_FILE}"
fi

# If NEXTFLUX_DEFAULT_SERVER_URL is defined
if [ -n "${NEXTFLUX_DEFAULT_SERVER_URL}" ]
then
    jq '.defaultServerUrl = env.NEXTFLUX_DEFAULT_SERVER_URL' --arg NEXTFLUX_DEFAULT_SERVER_URL "${NEXTFLUX_DEFAULT_SERVER_URL}" "${ENVIRONMENT_FILE}" > "${ENVIRONMENT_FILE}.tmp"
    mv "${ENVIRONMENT_FILE}.tmp" "${ENVIRONMENT_FILE}"
fi

# If NEXTFLUX_SINGLE_SERVER_MODE is defined and truthy
if [ "${NEXTFLUX_SINGLE_SERVER_MODE}" = "true" ] || [ "${NEXTFLUX_SINGLE_SERVER_MODE}" = "1" ] || [ "${NEXTFLUX_SINGLE_SERVER_MODE}" = "True" ]
then
    jq '.singleServerMode = true' "${ENVIRONMENT_FILE}" > "${ENVIRONMENT_FILE}.tmp"
    mv "${ENVIRONMENT_FILE}.tmp" "${ENVIRONMENT_FILE}"
fi

exec "$@"