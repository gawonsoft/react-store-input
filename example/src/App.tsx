import { useEffect } from "react";
import { createRender, useFormStore } from "react-store-input";

export default function App() {
  const store = useFormStore({
    email: "",
    password: "",
    rememberMe: false,
    role: "user" as "admin" | "user",
  });

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      console.log("State changed:", state);
    });

    return unsubscribe;
  }, [store]);

  const submit = async () => {
    const { email, password } = store.state;

    console.log(email, password);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <store.input name="email" type="email" />
      <store.input name="password" type="password" />
      <store.input name="rememberMe" type="checkbox" /> Remember Me
      <store.input name="role" type="radio" value="admin" /> Admin
      <store.input name="role" type="radio" value="user" /> User
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
      {createRender(store, (state) => (
        <pre>{JSON.stringify(state, null, 2)}</pre>
      ))}
    </form>
  );
}
