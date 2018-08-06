export const login = (server, account, password) => {
  console.log(`username=${account}&password=${password}`);
  return fetch(`${server}auth-token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${account}&password=${password}`,
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then((json) => {
        console.log(json);
        return json.token;
      });
    }
    return Promise.reject(new Error(response.status));
  });
};

export const authPing = (server, authenticateResult) =>
  fetch(`${server}auth/ping/`, {
    method: 'GET',
    headers: {
      Authorization: authenticateResult,
    },
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then(data => data);
    }
    return Promise.reject(new Error(response.status));
  });
