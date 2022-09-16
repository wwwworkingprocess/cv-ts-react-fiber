import { useState, FormEvent, ChangeEvent } from "react";
import { useDispatch } from "react-redux";

import { AuthError, AuthErrorCodes } from "firebase/auth";

import FormInput from "../form-input/form-input.component";
import Button from "../button/button.component";

import { SignUpContainer } from "./sign-up-form.styles";
import { signUpStart } from "../../store/user/user.action";

const defaultFormFields = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SignUpForm = () => {
  const dispatch = useDispatch();
  //
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, email, password, confirmPassword } = formFields;
  //
  const resetFormFields = () => {
    setFormFields({ ...defaultFormFields });
  };
  //
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //
    if (password !== confirmPassword) {
      alert("passwords do not match");
      return;
    }
    //
    try {
      dispatch(signUpStart(email, password, displayName));
      //
      resetFormFields();
    } catch (error) {
      if ((error as AuthError).code === AuthErrorCodes.EMAIL_EXISTS) {
        alert("Cannot create user, email already in use");
      }
      console.error("failed saving user", error);
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
    <SignUpContainer>
      <h2>Don't have an account?</h2>
      <span>Sign up with your email and password</span>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Display Name"
          required
          type="text"
          name="displayName"
          value={displayName}
          onChange={handleChange}
        />
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
        <FormInput
          label="Confirm Password"
          required
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
        />

        <Button type="submit">Sign up</Button>
      </form>
    </SignUpContainer>
  );
};

export default SignUpForm;
