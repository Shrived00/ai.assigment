import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isAuth ? (
        <div className="text-center text-lg text-green-600">
          Welcome! You are authenticated.
        </div>
      ) : (
        <div className="text-center text-lg text-red-600">
          <Link href='/sign-in'    >
            login
          </Link>
        </div>
      )}
    </div>
  );
}
