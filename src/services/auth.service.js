import http from "../http-common";
import authHeader from "./auth-header";

const register = (username, email, password) => {
    return http.post("auth/signup", {
        username,
        email,
        password,
    });
};

const login = (username, password) => {
    return http
        .post("auth/signin", {
            username,
            password,
        })
        .then((response) => {
            if (response.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }

            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const changePassword = (currentPassword, newPassword) => {
    return http.put("auth/change-password", {
        currentPassword,
        newPassword,
    }, { headers: authHeader() });
};


const authService = {
    register,
    login,
    logout,
    changePassword,
};

export default authService;