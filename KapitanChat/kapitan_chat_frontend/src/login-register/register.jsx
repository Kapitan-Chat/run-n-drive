import { useEffect, useRef, useState } from "react";
import styles from "./authentication.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Provider/AuthProvider";
import {
  loginRequest,
  registerRequest,
  validateEmail,
  validatePhone,
  validateUsername,
} from "./requests";

const RegisterStep = ({ registerStepDetails, stepNumber, errors }) => {
  const [currentStep, setCurrentStep] = stepNumber;

  const classname = `${styles.register_step} 
                      register-step-number-${currentStep + 1}`;

  return (
    <div className={classname}>
      {registerStepDetails.map((field, i) => {
        const [value, setValue, placeholder, required, _, fieldType] = field;
        return (
          <input
            key={currentStep + 1 + "_" + i}
            type={fieldType ? fieldType : "text"}
            placeholder={placeholder}
            required={required}
            value={value}
            style={{
              border: !errors[i]
                ? "3px solid rgb(219, 146, 146)"
                : "0px solid white",
            }}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        );
      })}
    </div>
  );
};

const Register = ({ onSubmit, animations }) => {
  //form data
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [inProcessState, setInProcess] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState([]);

  const navigate = useNavigate();

  const auth = useAuth();

  const startRegistration = () => {
    setInProcess("Registration...");
    const requestBody = {
      username,
      password,
      phone_number: phoneNumber,
      first_name: firstName,
    };
    if (lastName !== "") requestBody.last_name = lastName;
    if (email !== "") requestBody.email = email;
    registerRequest(requestBody, (isSuccess) => {
      if (isSuccess) {
        setInProcess("Logging in...");
        loginRequest({ username, password }, auth, (success) => {
          if (success) {
            setInProcess(null);
            navigate("/main");
          } else {
            animations.animateText("An error was occurred");
            animations.angry();

            setInProcess(null);
          }
        });
      } else {
        animations.animateText("An error was occurred");
        animations.angry();

        setInProcess(null);
      }
    });
  };

  onSubmit.current = (e) => {
    console.log(currentStep);
    const current = Object.values(registerStepsDetails)[currentStep - 1];
    const res = validateFields(true);
    console.log("validation result", res);

    const action =
      currentStep < Object.keys(registerStepsDetails).length
        ? () => setCurrentStep(currentStep + 1)
        : () => startRegistration();

    if (res.every(Boolean)) {
      let isErrorSet = false;
      let isFetching = false;
      const needToRequest = [];
      for (const f of current) {
        console.log(f);
        if (f[8] && f[0] !== "") {
          needToRequest.push(f);
        }
      }
      if (needToRequest.length) {
        let did = 0;
        for (const f of needToRequest) {
          isFetching = true;
          f[8](f[0]).then((res) => {
            if (res !== null) {
              if (res) {
                if (++did == needToRequest.length) action();
              } else {
                if (!isErrorSet) {
                  isErrorSet = true;
                  animations.animateText(f[9]);
                  animations.angry();
                }
              }
            } else {
              if (!isErrorSet) {
                isErrorSet = true;
                animations.animateText("An error was occurred");
                animations.angry();
              }
            }
          });
        }
      }
      if (!isFetching) {
        action();
      }
    }
  };

  const registerStepsDetails = {
    username: [
      [
        username,
        setUsername,
        "Enter your username",
        true,
        /^[A-Za-z][A-Za-z0-9]{3,32}$/,
        undefined,
        undefined,
        "Please, enter a valid login",
        validateUsername,
        "This username is taken, try other one",
      ],
    ],
    names: [
      [
        firstName,
        setFirstName,
        "Enter your first name",
        true,
        /^\p{L}{2,32}$/u,
        undefined,
        undefined,
        "Please, enter a valid name",
      ],
      [
        lastName,
        setLastName,
        "Enter your last name",
        false,
        /^\p{L}{2,32}$/u,
        undefined,
        undefined,
        "Please, enter a valid surname",
      ],
    ],
    email: [
      [
        phoneNumber,
        setPhoneNumber,
        "Enter your phone number",
        true,
        /^\+?[0-9\s\-()]{10,20}$/,
        undefined,
        undefined,
        "Please, enter a valid phone number (+xxxaaabbcc)",
        validatePhone,
        "Account with this phone number already registered!",
      ],
      [
        email,
        setEmail,
        "Enter your email",
        false,
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "EMAIL",
        undefined,
        "Please, enter a valid email",
        validateEmail,
        "Account with this email already registered!",
      ],
    ],
    password: [
      [
        password,
        setPassword,
        "Enter your password",
        true,
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
        "PASSWORD",
        undefined,
        "Your password is insecure, use letters, numbers and symbols",
      ],
      [
        confirmPassword,
        setConfirmPassword,
        "Enter your password",
        true,
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
        "PASSWORD",
        password,
        "Your passwords are not similar",
      ],
    ],
  };

  function validateFields(isOnSubmit = false) {
    const stepFields = Object.values(registerStepsDetails)[currentStep - 1];
    const errors = [];
    let isOnInvalidUsed = false;

    for (const v of stepFields) {
      const [value, _, _1, required, regex, _3, match, onInvalid] = v;
      const res =
        (regex.test(value) && (match ? match === value : true)) ||
        (!required && value === "");
      errors.push(res);
      if (isOnSubmit && !res && !isOnInvalidUsed && onInvalid) {
        animations.animateText(onInvalid);
        animations.angry();
        isOnInvalidUsed = true;
      }
    }

    return errors;
  }

  useEffect(
    () => setValidationErrors(validateFields()),
    [
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      currentStep,
    ]
  );

  return (
    <div className={styles.register_content}>
      <h2 className={styles.register_title}>Register</h2>
      <div className={styles.register_steps_wrapper}>
        {
          <RegisterStep
            stepNumber={[currentStep, setCurrentStep]}
            registerStepDetails={
              Object.values(registerStepsDetails)[currentStep - 1]
            }
            errors={validationErrors}
          />
        }
        <div className={styles.register_nav}>
          {currentStep > 1 && (
            <div
              className={[
                styles.register_nav_button,
                styles.left_register_nav_button,
              ].join(" ")}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </div>
          )}
          {currentStep < Object.keys(registerStepsDetails).length ? (
            <button
              type="submit"
              className={[
                styles.register_nav_button,
                styles.right_register_nav_button,
              ].join(" ")}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={inProcessState != null}
              className={[
                styles.register_button,
                styles.right_register_nav_button,
              ].join(" ")}
            >
              {inProcessState ? inProcessState : "Create account"}
            </button>
          )}
        </div>
      </div>
      <p className={styles.bottom_text}>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Log in</span>
      </p>
    </div>
  );
};

export default Register;
