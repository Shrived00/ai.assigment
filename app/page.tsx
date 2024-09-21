import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import ClientComponent from "./components/ClientComponent";

const Home = async () => {
  const { userId } = await auth(); // Fetch user ID on the server
  const isAuth = !!userId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900  text-white">
      {isAuth ? (
        <ClientComponent userId={userId} />
      ) : (
        <div className="text-center text-lg flex flex-col gap-5">
          <div className="">Welcome !!</div>
          <Link href="/sign-in" className="border p-1  bg-blue-700 rounded-lg">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
