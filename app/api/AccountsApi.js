export const login = (server, account, password) => {
  console.log(`username=${account}&password=${password}`);
  const details = {
    username: account,
    password,
  };
  let formBody = [];
  for (const property in details) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(details[property]);
    formBody.push(`${encodedKey}=${encodedValue}`);
  }
  formBody = formBody.join('&');
  return fetch(`${server}auth-token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formBody,
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json().then((json) => {
        console.log(json);
        return json.token;
      });
    }
    console.log(response.text());
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
