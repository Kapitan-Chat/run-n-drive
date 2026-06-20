import { Outlet, Route, Routes } from "react-router-dom";
import Main from "./Main/Main";
import NotFound from "./ComponentPage/NotFound";

import "./mainstyle.css";
import AuthProvider from "./Provider/AuthProvider";
import AvatarUpload from "./ComponentPage/AvatarUpload";
import Authentication from "./login-register/authentication";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Main />}></Route>
        <Route path="main" element={<Main />}></Route>
        <Route
          path="authorization"
          element={<Authentication authType="register" />}
        />
        <Route
          path="register"
          element={<Authentication authType="register" />}
        />
        <Route path="login" element={<Authentication authType="login" />} />
        <Route path="avatar" element={<AvatarUpload />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Outlet />
    </AuthProvider>
  );
}

export default App;
