import { Fragment } from "react";
import { Outlet } from "react-router-dom";

// import { useSelector, useDispatch } from "react-redux";

/*
import { selectCurrentUser } from "../../store/user/user.selector";

*/

import { ReactComponent as AppLogo } from "../../assets/svg/test.svg";

import {
  NavigationContainer,
  LogoContainer,
  NavLinks,
  NavLink,
} from "./navigation.styles";

const Navigation = () => {
  // const dispatch = useDispatch();
  //
  const currentUser = null; // useSelector(selectCurrentUser);
  //
  const signOutUser = () => null; // dispatch(signOutStart());
  //
  return (
    <>
      <NavigationContainer>
        <LogoContainer to="/">
          <AppLogo className="logo" style={{ width: "50px", height: "50px" }} />
        </LogoContainer>
        <NavLinks>
          <NavLink to="/map">MAP</NavLink>
          <NavLink to="/courses">COURSES</NavLink>
          <NavLink to="/demos">DEMOS</NavLink>

          {currentUser ? (
            <NavLink as="span" onClick={signOutUser}>
              SIGN OUT
            </NavLink>
          ) : (
            <NavLink to="/auth">SIGN IN</NavLink>
          )}
        </NavLinks>
      </NavigationContainer>
      <Outlet />
    </>
  );
};

export default Navigation;
