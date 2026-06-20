import axios from "axios";

const loginRequest = (body, auth, callback = (isSuccess) => {}) => {
  axios
    .post(`${import.meta.env.VITE_BASEAPI}users/token/`, body)
    .then((response) => {
      console.log("Вхід успішний!", response.data);

      const access = response.data.access;
      const refresh = response.data.refresh;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      auth.setToken({
        JWTaccessToken: access,
        JWTrefreshToken: refresh,
      });

      auth.login();

      callback(true, { access, refresh });
    })
    .catch((error) => {
      console.error("There was an error!", error);
      callback(false, {});
    });
};

const registerRequest = (body, callback = (isSuccess) => {}) => {
  axios
    .post(`${import.meta.env.VITE_BASEAPI}users/register/`, body)
    .then((response) => {
      console.log("Реєстрація успішна!");
      callback(true);
    })
    .catch((error) => {
      console.error("There was an error!", error);
      callback(false);
    });
};

const genericValidate = async (name, param) => {
  try {
    const params = {};
    params[name] = param;

    const res = await axios.get(
      `${import.meta.env.VITE_BASEAPI}users/validation/${name}`,
      {
        params,
      }
    );
    return res.data.available;
  } catch (error) {
    console.error("error when fetching validator", error);
    return null;
  }
};

const validateUsername = async (username) => {
  return await genericValidate("nickname", username);
};

const validateEmail = async (email) => {
  return await genericValidate("email", email);
};

const validatePhone = async (phone) => {
  return await genericValidate("phone", phone);
};

export {
  loginRequest,
  registerRequest,
  validateEmail,
  validatePhone,
  validateUsername,
};
