import { useState } from "react";
import Home from "./components/Home";
import Header from "./components/Header";

function App() {
  return (
    <>
      <div className="relative w-full min-h-screen grid place-items-center  ">
        <Header />
        <Home />
      </div>
    </>
  );
}

export default App;
