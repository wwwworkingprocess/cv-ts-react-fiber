import { Fragment } from "react";
import { Outlet } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";
import { signOutStart } from "../../store/user/user.action";

import {
  NavigationContainer,
  LogoContainer,
  NavLinks,
  NavLink,
} from "./navigation.styles";

import { ReactComponent as AppLogo } from "../../assets/svg/test.svg";
import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";

const Navigation = () => {
  const dispatch = useDispatch();
  //
  const currentUser = useSelector(selectCurrentUser);
  //
  const signOutUser = () => dispatch(signOutStart());
  //
  return (
    <>
      <NavigationContainer>
        <LogoContainer to="/">
          <AppLogo className="logo" style={{ width: "50px", height: "50px" }} />
        </LogoContainer>
        <NavLinks>
          <NavLink to="/map">MAP</NavLink>
          <NavLink to="/viewer">VIEWER</NavLink>
          <NavLink to="/skills">SKILLS</NavLink>
          <NavLink to="/demos">DEMOS</NavLink>

          {IS_CLOUD_ENABLED &&
            (currentUser ? (
              <NavLink as="span" onClick={signOutUser}>
                SIGN OUT
              </NavLink>
            ) : (
              <NavLink to="/auth">SIGN IN</NavLink>
            ))}
        </NavLinks>
      </NavigationContainer>
      <Outlet />
    </>
  );
};

export default Navigation;
