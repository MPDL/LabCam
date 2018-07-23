export const getDestinationLibrary = (server, authenticateResult) =>
  fetch(`${server}default-repo/`, {
    method: 'GET',
    headers: {
      Authorization: authenticateResult,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json().then(json => json.repo_id);
    }
    return Promise.reject(new Error(response.status));
  });

export const getLibraries = (server, authenticateResult) =>
  fetch(`${server}repos/`, {
    method: 'GET',
    headers: {
      Authorization: authenticateResult,
      Accept: 'application/json; indent=4',
    },
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then(json => json);
    }
    return Promise.reject(new Error(response.status));
  });

export const getDirectories = (server, authenticateResult, library, path, t) =>
  fetch(`${server}repos/${library}/dir/?t=${t}&recursive=0&p=${path}`, {
    method: 'GET',
    headers: {
      Authorization: authenticateResult,
      Accept: 'application/json; indent=4',
    },
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then(json => json);
    }
    return Promise.reject(new Error(response.status));
  });
