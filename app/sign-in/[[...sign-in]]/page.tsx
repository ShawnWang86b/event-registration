import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
