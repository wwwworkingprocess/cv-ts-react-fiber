import { useState, FormEvent, ChangeEvent } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../form-input/form-input.component";
import Button, { BUTTON_TYPE_CLASSES } from "../button/button.component";

import { AuthError, AuthErrorCodes } from "firebase/auth";

import { SignInContainer, ButtonsContainer } from "./sign-in-form.styles";
import {
  emailSignInStart,
  googleSignInStart,
} from "../../store/user/user.action";

const defaultFormFields = { email: "", password: "" };

const SignInForm = () => {
  const dispatch = useDispatch();
  //
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;
  //
  const resetFormFields = () => {
    setFormFields({ ...defaultFormFields });
  };
  //
  const signInWithGoogle = async () => {
    dispatch(googleSignInStart());
  };
  //
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //
    try {
      dispatch(emailSignInStart(email, password));
      //
      resetFormFields();
    } catch (error) {
      switch ((error as AuthError).code) {
        case AuthErrorCodes.INVALID_PASSWORD:
          alert("Incorrect password or email");
          break;
        case AuthErrorCodes.USER_DELETED:
          alert("No user associated with this email address");
          break;
        default:
      }
    }
  };
  //
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    //
    setFormFields({ ...formFields, [name]: value });
  };
  //

  return (
    <SignInContainer>
      <h2>Already have an account</h2>
      <span>Sign in with your email and password</span>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          required
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
        />
        <FormInput
          label="Password"
          required
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
        />

        <ButtonsContainer>
          <Button type="submit">Sign in</Button>
          <Button
            buttonType={BUTTON_TYPE_CLASSES.google}
            type="button"
            onClick={signInWithGoogle}
          >
            Google Sign in
          </Button>
        </ButtonsContainer>
      </form>
    </SignInContainer>
  );
};

export default SignInForm;
