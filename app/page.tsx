import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import ClientComponent from "./components/ClientComponent";

const Home = async () => {
  const { userId } = await auth(); // Fetch user ID on the server
  const isAuth = !!userId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isAuth ? (
        <ClientComponent userId={userId} />
      ) : (
        <div className="text-center text-lg text-red-600">
          <Link href="/sign-in">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
