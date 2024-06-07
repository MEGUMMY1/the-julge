import { useForm } from "react-hook-form";
import { SignupFormData } from "../types/types";
import { validateSignupData } from "@/utils/validateFormData";
import { useRouter } from "next/router";
import {
  INVALID_EMAIL,
  INVALID_PASSWORD,
} from "../../Signin/ErrorMessage/errorMessage";
import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "axios";
import UserTypeSelect from "../UserTypeSelect";
import styles from "./SignupForm.module.scss";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;

const BASE_URL = "https://bootcamp-api.codeit.kr/api/3-3/the-julge";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({ mode: "onChange" });
  const router = useRouter();

  const {
    email: emailError,
    password: passwordError,
    passwordCheck: passwordCheckError,
  } = errors;

  const onSubmit = async (formData: SignupFormData) => {
    try {
      validateSignupData(formData);
      const { data } = await axios.post(`${BASE_URL}/users`, formData);
      console.log(data);
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { message } = error.response.data;
        alert(message);
      } else if (error instanceof TypeError) {
        alert(error.message);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="이메일"
        error={emailError}
        register={register("email", {
          pattern: {
            value: emailRegex,
            message: INVALID_EMAIL,
          },
        })}
      />
      <Input
        label="비밀번호"
        error={passwordError}
        type="password"
        register={register("password", {
          pattern: {
            value: passwordRegex,
            message: INVALID_PASSWORD,
          },
        })}
      />
      <Input
        label="비밀번호 확인"
        error={passwordCheckError}
        type="password"
        register={register("passwordCheck", {
          pattern: {
            value: passwordRegex,
            message: INVALID_PASSWORD,
          },
        })}
      />
      <UserTypeSelect />
      <Button btnColorType="orange">가입하기</Button>
    </form>
  );
}

//
